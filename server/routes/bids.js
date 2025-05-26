const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all bids
router.get('/', async (req, res) => {
  try {
    const bids = await pool.query('SELECT * FROM Bids');
    res.json(bids.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST place a bid
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { itemId, userId, bidAmount } = req.body;

    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT MAX(bidAmount) as max FROM Bids WHERE itemId = $1',
      [itemId]
    );

    if (existing.rows[0].max !== null && bidAmount <= existing.rows[0].max) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Bid must be higher than existing bids' });
    }

    const newBid = await client.query(
      'INSERT INTO Bids (itemId, userId, bidAmount) VALUES ($1, $2, $3) RETURNING *',
      [itemId, userId, bidAmount]
    );

    await client.query(
      'UPDATE Items SET currentPrice = $1 WHERE itemId = $2',
      [bidAmount, itemId]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Bid placed successfully',
      bid: newBid.rows[0],
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bid creation error:', err.message);
    res.status(500).send('Server error during bid process');
  } finally {
    client.release();
  }
});

router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await pool.query(`
      SELECT Bids.*, Students.studentName AS bidderName
      FROM Bids
      JOIN Students ON Bids.userId = Students.userId
      WHERE Bids.itemId = $1
      ORDER BY Bids.bidAmount DESC
    `, [itemId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bids = await pool.query(
      `WITH UserHighestBids AS (
      SELECT 
        b.itemid,
        b.userid,
        MAX(b.bidamount) AS highest_bid
      FROM Bids b
      GROUP BY b.itemid, b.userid
      )

      SELECT 
        b.*, 
        i.title AS itemname, 
        i.image AS itemimage,
        CASE 
          WHEN t.transactionid IS NOT NULL AND b.bidamount = uhb.highest_bid THEN TRUE
          ELSE FALSE
        END AS didwin
      FROM Bids b
      JOIN Items i ON b.itemid = i.itemid
      LEFT JOIN UserHighestBids uhb 
        ON b.itemid = uhb.itemid AND b.userid = uhb.userid
      LEFT JOIN Transactions t 
        ON t.itemid = b.itemid AND t.buyerid = b.userid
      WHERE b.userid = $1
      ORDER BY b.bidid DESC;
      `,
      [userId]
    );
    res.json(bids.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;
