const express = require("express");
const router = express.Router();
const pegawaiController = require("../controllers/pegawaiController");

// Create Pegawai
router.post("/", pegawaiController.createPegawai);

// Get All Pegawai
router.get("/", pegawaiController.getAllPegawai);
router.get("/with-shift", pegawaiController.getAllPegawaiWithShift);
router.get("/without-shift", pegawaiController.getAllPegawaiWithoutShift);

// Get Pegawai by ID
router.get("/:id", pegawaiController.getPegawaiById);

// Update Pegawai
router.put("/:id", pegawaiController.updatePegawai);

// Delete Pegawai
router.delete("/:id", pegawaiController.deletePegawai);

module.exports = router;
