const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db'); 
require("dotenv").config();

// middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend adresin
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/items", require("./routes/items"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/students", require("./routes/students"));
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reports", require("./routes/reports"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});