const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db'); 
// middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/items", require("./routes/items"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/user-rewards", require("./routes/userRewards"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/students", require("./routes/students"));
app.use("/api/users", require("./routes/users"));


app.listen(5000, () => {
    console.log("Server running on port 5000");
});