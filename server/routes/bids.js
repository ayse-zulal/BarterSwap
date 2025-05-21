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
      `SELECT b.*, i.title AS itemname, i.image AS itemimage
       FROM Bids b
       JOIN Items i ON b.itemId = i.itemId
       WHERE b.userId = $1
       ORDER BY b.bidid DESC`,
      [userId]
    );
    res.json(bids.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;
