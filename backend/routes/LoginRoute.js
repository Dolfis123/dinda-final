const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sqlQuery = "SELECT * FROM login WHERE email = ?";
  db.query(sqlQuery, [email], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ Status: "Error", Error: "Error in server" });
    }

    if (result.length === 0) {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, passwordMatches) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res
          .status(500)
          .json({ Status: "Error", Error: "Error in server" });
      }

      if (passwordMatches) {
        req.session.loggedin = true;
        req.session.userId = user.id; // Menyimpan ID user, bukan email
        res.json({ Status: "Success" });
      } else {
        return res.json({ Status: "Error", Error: "Wrong Email or Password" });
      }
    });
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

module.exports = router;
