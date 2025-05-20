const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await pool.query('SELECT * FROM Messages');
    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create a new message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content, isRead, timeStamp } = req.body;
    const newMessage = await pool.query(
      'INSERT INTO Messages (senderId, receiverId, content, isRead, timeStamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [senderId, receiverId, content, isRead, timeStamp]
    );
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
