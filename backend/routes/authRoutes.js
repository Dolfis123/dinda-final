const express = require("express");
const { login, register } = require("../controllers/authController");

const router = express.Router();

// Route untuk login
router.post("/login", login);

// Route untuk registrasi
router.post("/register", register);

module.exports = router;
