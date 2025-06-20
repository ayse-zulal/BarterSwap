const express = require('express');
const router = express.Router();
const pool = require('../db');

// get a users messages
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
      m.*,
      CASE 
        WHEN m.senderid = $1 THEN m.receiverid
        ELSE m.senderid
      END AS partnerid,
      s.studentname AS partnername
      FROM Messages m
      JOIN Students s ON s.userid = (
        CASE 
          WHEN m.senderid = $1 THEN m.receiverid
          ELSE m.senderid
        END
      )
      WHERE m.senderid = $1 OR m.receiverid = $1
      ORDER BY partnerid, m.timestamp DESC;
    `, [userId]);

    const messagesByPartner = {};
    for (let row of result.rows) {
      const partnerId = row.partnerid;
      if (!messagesByPartner[partnerId]) {
        messagesByPartner[partnerId] = [];
      }
      messagesByPartner[partnerId].push(row);
    }

    res.json(messagesByPartner);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// create a new message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content, isRead } = req.body;
    const newMessage = await pool.query(
      'INSERT INTO Messages (senderId, receiverId, content, isRead, timeStamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [senderId, receiverId, content, isRead, new Date()]
    );
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// mark a message as already read
router.post('/mark-read', async (req, res) => {
  const { senderid, receiverid } = req.body;
  try {
    await pool.query(
      `UPDATE Messages
       SET isread = TRUE
       WHERE senderid = $1 AND receiverid = $2 AND isread = FALSE`,
      [senderid, receiverid]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
