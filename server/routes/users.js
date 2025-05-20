const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM Users');
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create a new user
router.post('/', async (req, res) => {
  try {
    const { loginStreak, lastLogin, reputation } = req.body;
    const newUser = await pool.query(
      'INSERT INTO Users (loginStreak, lastLogin, reputation) VALUES ($1, $2, $3) RETURNING *',
      [loginStreak, lastLogin, reputation]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// GET user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM Users WHERE userId = $1", [req.params.userId]);
    const balance = await pool.query("SELECT * FROM VirtualCurrency WHERE userId = $1", [req.params.userId]);
    const student = await pool.query("SELECT * FROM Students WHERE userId = $1", [req.params.userId]);
    res.json({ user: user.rows[0], student: student.rows[0], balance: balance.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

