const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await pool.query('SELECT * FROM Transactions');
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
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
        i.title AS item_title,
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
      'INSERT INTO Transactions (buyerId, sellerId, itemId, price, transactionDate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [buyerId, sellerId, itemId, price, transactionDate]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
