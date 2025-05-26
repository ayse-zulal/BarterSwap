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
    const { studentId, userId, studentName, password, email } = req.body;
    const newStudent = await pool.query(
      'INSERT INTO Students (studentId, userId, studentName, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, userId, studentName, password, email]
    );
    res.json(newStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put("/:studentid", async (req, res) => {
  const { studentid } = req.params;
  const { studentname, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Students
       SET studentname = $1, email = $2
       WHERE studentid = $3
       RETURNING studentid, studentname, email`,
      [studentname, email, studentid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating student info:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;
