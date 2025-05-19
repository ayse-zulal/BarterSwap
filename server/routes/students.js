const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await pool.query('SELECT * FROM Students');
    res.json(students.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create a new student
router.post('/', async (req, res) => {
  try {
    const { studentId, userId, studentName, department } = req.body;
    const newStudent = await pool.query(
      'INSERT INTO Students (studentId, userId, studentName, department) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, userId, studentName, department]
    );
    res.json(newStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
