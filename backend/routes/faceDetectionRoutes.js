const express = require("express");
const router = express.Router();
const faceDetectionController = require("../controllers/faceDetectionController");
const multer = require("multer");

// Konfigurasi Multer untuk upload file
const upload = multer({ dest: "public/images/" });

router.post(
  "/register",
  upload.single("image"),
  faceDetectionController.registerFace
);

module.exports = router;
