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

// POST create a new transaction
router.post('/', async (req, res) => {
  try {
    const { userId, amount, transactionType, transactionDate } = req.body;
    const newTransaction = await pool.query(
      'INSERT INTO Transactions (userId, amount, transactionType, transactionDate) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, amount, transactionType, transactionDate]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
