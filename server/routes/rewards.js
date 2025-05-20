const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all rewards
router.get('/', async (req, res) => {
  try {
    const rewards = await pool.query('SELECT * FROM Rewards');
    res.json(rewards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create a new reward
router.post('/', async (req, res) => {
  try {
    const { rewardName, rewardType, rewardAmount, conditionType, conditionValue } = req.body;
    const newReward = await pool.query(
      'INSERT INTO Rewards (rewardName, rewardType, rewardAmount, conditionType, conditionValue) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rewardName, rewardType, rewardAmount, conditionType, conditionValue]
    );
    res.json(newReward.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
