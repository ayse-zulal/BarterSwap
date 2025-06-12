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
router.post("/", async (req, res) => {
  const client = await pool.connect();
  const { rewardtype, rewardname, rewardamount, conditiontype, conditionvalue } = req.body;

  try {
    await client.query("BEGIN");

    // 1. Ödülü ekle
    const rewardInsert = await client.query(
      `INSERT INTO rewards (rewardtype, rewardname, rewardamount, conditiontype, conditionvalue)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING rewardid`,
      [rewardtype, rewardname, rewardamount, conditiontype, conditionvalue]
    );

    const rewardId = rewardInsert.rows[0].rewardid;

    // 2. Şartlara uyan kullanıcıları belirle
    let conditionQuery = "";

    switch (conditiontype) {
      case "login_streak":
        conditionQuery = `
          SELECT userid FROM users WHERE loginstreak >= $1
        `;
        break;

      case "reputation":
        conditionQuery = `
          SELECT userid FROM users WHERE reputation >= $1
        `;
        break;

      case "total_bids":
        conditionQuery = `
          SELECT userid FROM bids
          GROUP BY userid
          HAVING COUNT(*) >= $1
        `;
        break;

      case "total_items_listed":
        conditionQuery = `
          SELECT userid FROM items
          GROUP BY userid
          HAVING COUNT(*) >= $1
        `;
        break;

      case "total_items_bought":
        conditionQuery = `
          SELECT buyerid AS userid FROM transactions
          GROUP BY buyerid
          HAVING COUNT(*) >= $1
        `;
        break;

      case "total_items_sold":
        conditionQuery = `
          SELECT sellerid AS userid FROM transactions
          GROUP BY sellerid
          HAVING COUNT(*) >= $1
        `;
        break;

      case "total_spent":
        conditionQuery = `
          SELECT buyerid AS userid FROM transactions
          GROUP BY buyerid
          HAVING SUM(price) >= $1
        `;
        break;

      default:
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid condition type" });
    }


    const usersRes = await client.query(conditionQuery, [conditionvalue]);
    const eligibleUserIds = usersRes.rows.map(row => row.userid);
    console.log(eligibleUserIds.slice(0,10))

    if (eligibleUserIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(200).json({ message: "Reward added, but no eligible users found." });
    }
    

    for (const userId of eligibleUserIds) {
      const alreadyRewardedRes = await client.query(
        `SELECT 1 FROM userrewards WHERE userid = $1 AND rewardid = $2`,
        [userId, rewardId]
      );

      if (alreadyRewardedRes.rowCount === 0) {
        await client.query(
          `UPDATE virtualcurrency SET balance = balance + $1 WHERE userid = $2`,
          [rewardamount, userId]
        );

        await client.query(
          `INSERT INTO userrewards (userid, rewardid, timeearned)
          VALUES ($1, $2, $3)`,
          [userId, rewardId, new Date()]
        );
      }
      
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Reward distributed successfully", rewardId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reward insertion error:", err);
    res.status(500).json({ error: "Failed to create reward" });
  } finally {
    client.release();
  }
});

module.exports = router;
