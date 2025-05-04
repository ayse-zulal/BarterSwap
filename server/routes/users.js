const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.createUser);
// ileriye dönük olarak buraya GET, PUT, DELETE de eklenebilir

module.exports = router;
