const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all items
router.get('/available', async (req, res) => {
  try {
    const itemsResult = await pool.query('SELECT * FROM Items WHERE isactive = TRUE');
    const items = itemsResult.rows;

    if (items.length === 0) {
      return res.json([]);
    }

    const bidsResult = await pool.query(
      'SELECT * FROM Bids WHERE itemid = ANY($1)',
      [items.map(item => item.itemid)]
    );

    const bids = bidsResult.rows;

    const itemIdToBids = {};
    for (const bid of bids) {
      if (!itemIdToBids[bid.itemid]) {
        itemIdToBids[bid.itemid] = [];
      }
      itemIdToBids[bid.itemid].push(bid);
    }

    const itemsWithBids = items.map(item => ({
      ...item,
      bids: itemIdToBids[item.itemid] || [],
    }));

    res.json(itemsWithBids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await pool.query('SELECT * FROM Items WHERE itemId = $1', [itemId]);
    if (result.rows.length === 0) return res.status(404).send('Item not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put("/:itemId/mark-sold", async (req, res) => {
  const client = await pool.connect();
  const itemId = req.params.itemId;

  try {
    await client.query("BEGIN");

    // First lock the item and take it
    const itemRes = await client.query(
      `SELECT itemid, userid AS seller_id, isactive 
       FROM items WHERE itemid = $1 FOR UPDATE`,
      [itemId]
    );

    if (itemRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Item not found" });
    }

    const item = itemRes.rows[0];

    if (!item.isactive) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Item already sold" });
    }

    // Second lock the highest bid and take it
    const bidRes = await client.query(
      `SELECT bidid, userid AS buyer_id, bidamount 
       FROM bids 
       WHERE itemid = $1 
       ORDER BY bidamount DESC 
       LIMIT 1 
       FOR UPDATE`,
      [itemId]
    );

    if (bidRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No bids for this item" });
    }

    const highestBid = bidRes.rows[0];

    // Third lock the buyer and seller balances and take them
    const balancesRes = await client.query(
      `SELECT userId, balance FROM virtualcurrency WHERE userId = ANY($1::int[]) FOR UPDATE`,
      [[highestBid.buyer_id, item.seller_id]]
    );

    const buyerBalanceRow = balancesRes.rows.find(r => r.userid === highestBid.buyer_id);
    const sellerBalanceRow = balancesRes.rows.find(r => r.userid === item.seller_id);

    if (!buyerBalanceRow || !sellerBalanceRow) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: "User balances not found" });
    }

    if (buyerBalanceRow.balance < highestBid.bidAmount) {
      // Buyer has insufficient balance, remove the bid
      await client.query(
        `DELETE FROM bids WHERE bidid = $1`,
        [highestBid.bidid]
      );
      await client.query("COMMIT");

      return res.status(400).json({ error: "Buyer has insufficient balance, bid removed" });
    }

    // Money transfer
    await client.query(
      `UPDATE virtualcurrency SET balance = balance - $1 WHERE userId = $2`,
      [highestBid.bidamount, highestBid.buyer_id]
    );

    await client.query(
      `UPDATE virtualcurrency SET balance = balance + $1 WHERE userId = $2`,
      [highestBid.bidamount, item.seller_id]
    );

    // Add transaction record
    await client.query(
      `INSERT INTO transactions (itemid, sellerid, buyerid, price, transactiondate)
       VALUES ($1, $2, $3, $4, $5)`,
      [itemId, item.seller_id, highestBid.buyer_id, highestBid.bidamount, new Date()]
    );

    // Mark item as sold
    await client.query(
      `UPDATE items SET isactive = FALSE, userid = $1 WHERE itemid = $2`,
      [highestBid.buyer_id, itemId]
    );

    await client.query("COMMIT");

    res.json({ message: "Item sold successfully", buyerId: highestBid.buyer_id });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    client.release();
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await pool.query(
      'SELECT * FROM Items WHERE userId = $1',
      [userId]
    );
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      startingPrice,
      currentPrice,
      image,
      itemCondition,
      isActive,
      isRefunded,
    } = req.body;

    // 1. Category enum kontrolü
    const validCategories = ['electronics', 'furniture', 'beauty', 'books', 'home', 'fashion', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be one of: ' + validCategories.join(', ') });
    }

    // 2. Görsel URL kontrolü
    function isValidImageUrl(url) {
      return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    }
    if (!isValidImageUrl(image)) {
      return res.status(400).json({ error: 'Invalid image URL. Must be a link to an image (jpg, png, etc).' });
    }

    // 3. (İsteğe Bağlı) Boş alan kontrolü vs.
    if (!title || !description || !startingPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newItem = await pool.query(
      `INSERT INTO Items (
        userId, title, description, category,
        startingPrice, currentPrice, image,
        itemCondition, isActive, isRefunded
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        userId, title, description, category,
        startingPrice, currentPrice, image,
        itemCondition, isActive, isRefunded,
      ]
    );

    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
