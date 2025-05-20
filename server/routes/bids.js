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
    await pool.query('INSERT INTO Bids (userId, itemId, bidAmount) VALUES ($1, $2, $3) RETURNING *', [userId, itemId, bidAmount]);
    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(400).send(err.detail || 'Error placing bid');
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bids = await pool.query(
      `SELECT b.*, i.title AS itemname, i.image AS itemimage
       FROM Bids b
       JOIN Items i ON b.itemId = i.itemId
       WHERE b.userId = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(bids.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;
