const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await pool.query(
      `
      SELECT 
        t.transactionid,
        t.price,
        t.transactiondate,
        i.title AS itemtitle,
        i.description AS itemdescription,
        i.image AS itemimage,
        sb.studentname AS buyername,
        ss.studentname AS sellername
      FROM Transactions t
      JOIN Items i ON t.itemid = i.itemid
      JOIN Students sb ON t.buyerid = sb.userid
      JOIN Students ss ON t.sellerid = ss.userid
      ORDER BY t.transactiondate DESC;
      `);
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// GET transactions by user ID
router.get('/buyer/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        t.transactionid,
        t.itemid,
        t.buyerid,
        t.sellerid,
        t.price,
        t.transactiondate,
        i.title AS itemname,
        i.image,
        i.category,
        i.itemcondition
      FROM Transactions t
      JOIN Items i ON t.itemid = i.itemid
      WHERE t.buyerid = $1
      ORDER BY t.transactiondate DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buyer transactions:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create a new transaction
router.post('/', async (req, res) => {
  try {
    const { buyerId, sellerId, itemId, price, transactionDate } = req.body;
    const newTransaction = await pool.query(
      'INSERT INTO Transactions (buyerId, sellerId, itemId, price, transactionDate, feedback) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [buyerId, sellerId, itemId, price, transactionDate, null]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put("/:id/feedback", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { feedback } = req.body;

  const validTypes = ["positive", "neutral", "negative"];
  if (!validTypes.includes(feedback)) {
    return res.status(400).json({ error: "Invalid feedback type" });
  }

  const feedbackPoints = {
    positive: 2,
    neutral: 1,
    negative: -1,
  };

  try {
    await client.query("BEGIN");

    const transactionRes = await client.query(
      `SELECT * FROM transactions WHERE itemid = $1 FOR UPDATE`,
      [id]
    );

    if (transactionRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Transaction not found" });
    }

    const transaction = transactionRes.rows[0];
    const sellerId = transaction.sellerid;

    await client.query(
      `UPDATE transactions
       SET feedback = $1
       WHERE transactionid = $2`,
      [feedback, id]
    );

    await client.query(
      `UPDATE users
       SET reputation = COALESCE(reputation, 0) + $1
       WHERE userid = $2`,
      [feedbackPoints[feedback], sellerId]
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Feedback and reputation updated." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", err.message);
    res.status(500).send("Server error during feedback update");
  } finally {
    client.release();
  }
});

module.exports = router;
