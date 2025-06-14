const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
// get all users
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.*,
        s.studentname,
        s.email,
        s.studentid,
        vc.balance
      FROM Users u
      LEFT JOIN Students s ON u.userid = s.userid
      LEFT JOIN VirtualCurrency vc ON u.userid = vc.userid
      WHERE u.userid != 0
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// get user by ID
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

// delete a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const itemRes = await client.query(
      "SELECT itemid FROM Items WHERE userid = $1",
      [id]
    );
    const itemIds = itemRes.rows.map((row) => row.itemid);

    // delete users items bids first
    if (itemIds.length > 0) {
      await client.query(
        "DELETE FROM Bids WHERE itemid = ANY($1::int[])",
        [itemIds]
      );
    }

    // Delete user-related data in the correct order to maintain referential integrity
    await client.query("DELETE FROM Bids WHERE userid = $1", [id]);
    await client.query("DELETE FROM Transactions WHERE buyerid = $1 OR sellerid = $1", [id]);
    await client.query("DELETE FROM Items WHERE userid = $1", [id]);
    await client.query("DELETE FROM Students WHERE userid = $1", [id]);
    await client.query("DELETE FROM VirtualCurrency WHERE userid = $1", [id]);
    await client.query("DELETE FROM Messages WHERE senderid = $1 OR receiverid = $1", [id]);
    await client.query("DELETE FROM Users WHERE userid = $1", [id]);

    await client.query("COMMIT");
    res.json({ message: "User and related data deleted successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  } finally {
    client.release();
  }
});

module.exports = router;

