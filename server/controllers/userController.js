const pool = require("../db");

exports.createUser = async (req, res) => {
    try {
        const { loginStreak, lastLogin, reputation } = req.body;
        const result = await pool.query(
            "INSERT INTO Users (loginStreak, lastLogin, reputation) VALUES ($1, $2, $3) RETURNING *",
            [loginStreak, lastLogin, reputation]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};
