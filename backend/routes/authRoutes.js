const express = require("express");
const {
  login,
  register,
  updateUser,
  deleteUser,
  getUsersByRole,
} = require("../controllers/authController");

const router = express.Router();

// Route untuk login
router.post("/login", login);

// Route untuk registrasi
router.post("/register", register);

// Route untuk update user
router.put("/user/:id", updateUser);

// Route untuk delete user
router.delete("/user/:id", deleteUser);

// Rute untuk mendapatkan user berdasarkan role
router.get("/users-by-role", getUsersByRole);

module.exports = router;
