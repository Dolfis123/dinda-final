const express = require("express");
const router = express.Router();
const absensiController = require("../controllers/absensiController");
const multer = require("multer");

// Konfigurasi Multer untuk upload file
const upload = multer({ dest: "public/images/" });

router.post("/absen", upload.single("image"), absensiController.absen);

module.exports = router;
