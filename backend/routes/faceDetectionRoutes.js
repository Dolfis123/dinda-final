const express = require("express");
const router = express.Router();
const faceDetectionController = require("../controllers/faceDetectionController");
const multer = require("multer");

// Konfigurasi Multer untuk upload file
const upload = multer({ dest: "public/images/" });

// Mengubah dari `upload.single` ke `upload.array` untuk mendukung pengiriman beberapa gambar
router.post(
  "/register",
  upload.array("images", 5), // Mengizinkan maksimum 5 gambar, Anda bisa mengubahnya sesuai kebutuhan
  faceDetectionController.registerFace
);

module.exports = router;
