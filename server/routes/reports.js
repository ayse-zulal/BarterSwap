const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");
const pool = require("../db");

const sendCsvResponse = (res, rows, filename) => {
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  res.send(csv);
};

// Monthly Transaction Summary
router.get("/monthly", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(t.transactiondate, 'YYYY-MM') AS month,
        COUNT(*) AS total_transactions,
        SUM(t.price) AS total_price
      FROM Transactions t
      GROUP BY month
      ORDER BY month
    `);
    sendCsvResponse(res, result.rows, "monthly_summary.csv");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error generating report");
  }
});

// Top Users (based on bids and transactions)
router.get("/top-users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.studentname,
        COUNT(DISTINCT b.bidid) AS bid_count,
        COUNT(DISTINCT t.transactionid) AS transaction_count
      FROM Students s
      LEFT JOIN Bids b ON b.userid = s.userid
      LEFT JOIN Transactions t ON t.buyerid = s.userid
      GROUP BY s.studentname
      ORDER BY transaction_count DESC, bid_count DESC
      LIMIT 100
    `);
    sendCsvResponse(res, result.rows, "top_users.csv");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error generating report");
  }
});

// Category-wise Sales
router.get("/category-wise", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.category,
        COUNT(t.transactionid) AS items_sold,
        SUM(t.price) AS total_earned
      FROM Items i
      JOIN Transactions t ON i.itemid = t.itemid
      GROUP BY i.category
    `);
    sendCsvResponse(res, result.rows, "category_sales.csv");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error generating report");
  }
});

// Most Competitive Items (most bids)
router.get("/competitive-items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.title,
        COUNT(b.bidid) AS total_bids
      FROM Items i
      JOIN Bids b ON i.itemid = b.itemid
      GROUP BY i.title
      ORDER BY total_bids DESC
      LIMIT 100
    `);
    sendCsvResponse(res, result.rows, "most_competitive_items.csv");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error generating report");
  }
});

module.exports = router;
