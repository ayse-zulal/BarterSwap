const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded; // decoded => { id, iat, exp }
    next();
  });
}

module.exports = verifyToken;


