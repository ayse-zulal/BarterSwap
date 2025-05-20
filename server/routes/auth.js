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
    await client.query("BEGIN");

    const hashed = await bcrypt.hash(password, 10);

    // 1. Users tablosuna ekle
    const userResult = await client.query(
      "INSERT INTO Users (loginStreak, lastLogin, reputation) VALUES ($1, $2, $3) RETURNING *",
      [0, new Date(), 0]
    );

    const userId = userResult.rows[0].userid;

    // 2. Students tablosuna ekle
    const studentResult = await client.query(
      "INSERT INTO Students (studentId, userId, studentName, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [studentId, userId, userName, hashed, email]
    );

    // 3. VirtualCurrency tablosuna başlangıç bakiyesi ile ekle
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
  try {
    const result = await pool.query("SELECT * FROM Students WHERE studentId = $1", [studentId]);
    const student = result.rows[0];
    if (!student) return res.status(400).json({ error: "Student not found" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: student.userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, studentId: student.studentId });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", verifyToken, (req, res) => {
  res.json({ message: "Access granted", userId: req.user.id });
});

module.exports = router;