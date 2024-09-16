// routes/absensiRoutes.js

const express = require("express");
const router = express.Router();
const absensiController = require("../controllers/absensiControllerCrud");

// Rute untuk mengambil semua data absensi
router.get("/", absensiController.getAbsensi);

// Rute untuk menambahkan data absensi baru
router.post("/", absensiController.createAbsensi);

// Rute untuk mengupdate data absensi
router.put("/:id_absensi", absensiController.updateAbsensi);

// Rute untuk menghapus data absensi
router.delete("/:id_absensi", absensiController.deleteAbsensi);

module.exports = router;
