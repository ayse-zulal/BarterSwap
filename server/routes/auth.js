const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
// Register
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  const { studentId, userName, password, email, balance } = req.body;


  try {
    if (!/^\d{6}$/.test(studentId)) {
      return res.status(400).json({ error: "Öğrenci numarası 6 basamaklı olmalıdır." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Geçersiz e-posta adresi." });
    }
    await client.query("BEGIN");

    const hashed = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      "INSERT INTO Users (loginStreak, lastLogin, reputation) VALUES ($1, $2, $3) RETURNING *",
      [0, new Date(), 0]
    );

    const userId = userResult.rows[0].userid;

    const studentResult = await client.query(
      "INSERT INTO Students (studentId, userId, studentName, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [studentId, userId, userName, hashed, email]
    );

    await client.query(
      "INSERT INTO VirtualCurrency (userId, balance) VALUES ($1, $2)",
      [userId, balance]
    );

    await client.query("COMMIT");

    res.status(201).json({
      user: userResult.rows[0],
      student: studentResult.rows[0],
      message: "Registration successful.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", err);
    if (err.code === "23505") {
      res.status(400).json({ error: "Student already exists." });
    } else {
      res.status(500).json({ error: "Registration failed." });
    }
  } finally {
    client.release();
  }
});

// Login
router.post("/login", async (req, res) => {
  const { studentId, password } = req.body;
  let student1 = false;
  let match1 = false;

  try {
    const result = await pool.query("SELECT * FROM Students WHERE studentId = $1", [studentId]);
    const student = result.rows[0];

    if (!student) throw new Error("No student");

    student1 = true;

    const match = await bcrypt.compare(password, student.password);
    match1 = match;

    if (!match) throw new Error("Wrong password");

    const token = jwt.sign({ id: student.userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, studentId: student.studentId });
  } catch (err) {
    if (!student1) return res.status(400).json({ message: "No student found with this student number" });
    if (!match1) return res.status(400).json({ message: "Incorrect password. Please try again." });
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
});

// Authentication
router.get("/me", verifyToken, (req, res) => {
  res.json({ message: "Access granted", userId: req.user.id });
});

module.exports = router;