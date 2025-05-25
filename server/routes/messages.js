const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await pool.query('SELECT * FROM Messages');
    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        CASE 
          WHEN m.senderid = $1 THEN m.receiverid
          ELSE m.senderid
        END AS chat_partner_id
      FROM Messages m
      WHERE m.senderid = $1 OR m.receiverid = $1
      ORDER BY chat_partner_id, m.timestamp DESC;
    `, [userId]);

    const messagesByPartner = {};
    for (let row of result.rows) {
      const partnerId = row.chat_partner_id;
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

// POST create a new message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, content, isRead, timeStamp } = req.body;
    const newMessage = await pool.query(
      'INSERT INTO Messages (senderId, receiverId, content, isRead, timeStamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [senderId, receiverId, content, isRead, timeStamp]
    );
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
