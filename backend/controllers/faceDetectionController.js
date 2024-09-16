const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FaceData = require("../models/faceDataModel");
const Pegawai = require("../models/pegawaiModel"); // Import model Pegawai
const axios = require("axios");
const fs = require("fs");

function areEncodingsSimilar(encoding1, encoding2) {
  let distance = 0;
  for (let i = 0; i < encoding1.length; i++) {
    distance += Math.pow(encoding1[i] - encoding2[i], 2);
  }
  return Math.sqrt(distance) < 0.6; // Threshold bisa disesuaikan
}

exports.registerFace = async (req, res) => {
  try {
    const { id_pegawai } = req.body;
    const imagePath = req.file.path;
    const formData = {
      image: fs.createReadStream(imagePath),
    };

    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/detect-face`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.data.success) {
      const faceEncoding = response.data.face_encoding;
      const encodings = await FaceData.findAll({
        include: {
          model: Pegawai, // Sertakan data Pegawai
          attributes: ["nama"], // Ambil hanya nama pegawai
        },
      });

      for (const data of encodings) {
        const storedEncoding = JSON.parse(
          Buffer.from(data.face_encoding).toString()
        );
        if (areEncodingsSimilar(storedEncoding, faceEncoding)) {
          const pegawai = data.Pegawai; // Ambil data pegawai yang terasosiasi

          return res.status(400).json({
            message: `Registrasi gagal: Wajah ini telah terdaftar pada pegawai ${pegawai.nama}. Pendaftaran ulang tidak diizinkan.`,
            success: false,
          });
        }
      }

      // Simpan data wajah baru
      await FaceData.create({
        id_pegawai,
        face_encoding: Buffer.from(JSON.stringify(faceEncoding)),
      });

      res.json({
        message: "Registrasi berhasil: Wajah telah sukses didaftarkan.",
        success: true,
      });
    } else {
      res.status(400).json({
        message:
          "Gagal mendeteksi wajah. Pastikan wajah Anda terlihat jelas di gambar.",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
      success: false,
    });
  }
};
