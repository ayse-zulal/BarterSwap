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
    const validCategories = ['electronics', 'fashion', 'books', 'home'];
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
