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
  try {
    const { userId, itemId, bidAmount } = req.body;
    // You can call your insert_bid function via SQL here
    await pool.query('SELECT insert_bid($1, $2, $3)', [userId, itemId, bidAmount]);
    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(400).send(err.detail || 'Error placing bid');
  }
});

module.exports = router;
