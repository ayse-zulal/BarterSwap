const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all user rewards
router.get('/', async (req, res) => {
  try {
    const userRewards = await pool.query('SELECT * FROM UserRewards');
    res.json(userRewards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST assign a reward to user
router.post('/', async (req, res) => {
  try {
    const { userId, rewardId, timeEarned } = req.body;
    const newUserReward = await pool.query(
      'INSERT INTO UserRewards (userId, rewardId, timeEarned) VALUES ($1, $2, $3) RETURNING *',
      [userId, rewardId, timeEarned]
    );
    res.json(newUserReward.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
