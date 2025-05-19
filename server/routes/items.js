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
    const { itemName, startingPrice, currentPrice, isActive } = req.body;
    const newItem = await pool.query(
      'INSERT INTO Items (itemName, startingPrice, currentPrice, isActive) VALUES ($1, $2, $3, $4) RETURNING *',
      [itemName, startingPrice, currentPrice, isActive]
    );
    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
