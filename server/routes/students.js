const express = require('express');
const router = express.Router();
const pool = require('../db');

// update a students information
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
