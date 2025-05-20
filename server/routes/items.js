const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM Items');
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, category, startingPrice, currentPrice, image, itemCondition, isActive, isRefunded } = req.body;
    const newItem = await pool.query(
      'INSERT INTO Items (userId, title, description, category, startingPrice, currentPrice, image, itemCondition, isActive, isRefunded) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [userId, title, description, category, startingPrice, currentPrice, image, itemCondition, isActive, isRefunded]
    );
    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
