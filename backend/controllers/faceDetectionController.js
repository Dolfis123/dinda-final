const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FaceData = require("../models/faceDataModel");
const Pegawai = require("../models/pegawaiModel");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data"); // Pastikan Anda mengimpor form-data

// Fungsi untuk menghitung Cosine Similarity antara dua encoding wajah
function cosineSimilarity(encoding1, encoding2) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < encoding1.length; i++) {
    dotProduct += encoding1[i] * encoding2[i];
    normA += Math.pow(encoding1[i], 2);
    normB += Math.pow(encoding2[i], 2);
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0; // Pencegahan jika ada vector yang nol

  return dotProduct / (normA * normB);
}

// Fungsi untuk menghitung Jarak Euclidean antara dua encoding wajah
function euclideanDistance(encoding1, encoding2) {
  let sum = 0;
  for (let i = 0; i < encoding1.length; i++) {
    sum += Math.pow(encoding1[i] - encoding2[i], 2);
  }
  return Math.sqrt(sum);
}

function areEncodingsSimilar(
  encoding1,
  encoding2,
  cosineThreshold = 0.3,
  euclideanThreshold = 0.4
) {
  const cosineSimilarityValue = cosineSimilarity(encoding1, encoding2);
  const euclideanDistanceValue = euclideanDistance(encoding1, encoding2);

  console.log(
    `Cosine Similarity: ${cosineSimilarityValue}, Euclidean Distance: ${euclideanDistanceValue}`
  );

  // Memastikan kedua metode perbandingan digunakan dengan nilai threshold yang lebih ketat
  return (
    cosineSimilarityValue > cosineThreshold &&
    euclideanDistanceValue < euclideanThreshold
  );
}

exports.registerFace = async (req, res) => {
  try {
    const { id_pegawai } = req.body;

    // Cek apakah pegawai sudah memiliki data wajah sebelum melakukan proses apapun
    const existingFaceData = await FaceData.findOne({
      where: { id_pegawai },
    });

    if (existingFaceData) {
      return res.status(400).json({
        message: `Pegawai dengan ID ${id_pegawai} sudah memiliki wajah yang terdaftar.`,
        success: false,
      });
    }

    const imagePaths = req.files.map((file) => file.path); // Ambil semua path file gambar
    const formData = new FormData(); // Pastikan menggunakan FormData dari library form-data

    imagePaths.forEach((imagePath, index) => {
      formData.append("images", fs.createReadStream(imagePath)); // Append semua gambar dengan key yang sama
      console.log(`Menambahkan gambar ke formData: ${imagePath}`); // Tambahkan log untuk memastikan gambar ditambahkan
    });

    // Kirim gambar ke server Python untuk mendeteksi wajah dan mendapatkan encoding
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/detect-face`,
      formData,
      {
        headers: formData.getHeaders(), // Perbarui headers dengan formData.getHeaders()
      }
    );

    console.log(response.data); // Tambahkan log untuk melihat respon dari server Python

    if (response.data.success) {
      const faceEncodings = response.data.face_encodings; // Semua encoding yang diterima dari Python

      // Ambil semua encoding wajah yang sudah terdaftar
      const encodings = await FaceData.findAll({
        include: {
          model: Pegawai, // Sertakan data pegawai
          attributes: ["id_pegawai", "nama"], // Ambil ID dan nama pegawai
        },
      });

      // Pengecekan apakah wajah sudah terdaftar
      for (const data of encodings) {
        const storedEncodings = JSON.parse(
          Buffer.from(data.face_encoding).toString()
        );

        let similarityCount = 0; // Menghitung berapa kali wajahnya dianggap mirip

        // Cek apakah ada satu encoding yang mirip dari wajah yang terdaftar
        for (const newEncoding of faceEncodings) {
          for (const storedEncoding of storedEncodings) {
            if (areEncodingsSimilar(storedEncoding, newEncoding)) {
              similarityCount++;
            }
          }
        }

        // Pastikan hanya menganggap wajah sebagai mirip jika lebih dari 50% encodingnya mirip
        if (similarityCount >= Math.floor(faceEncodings.length * 0.5)) {
          const pegawai = data.Pegawai; // Ambil data pegawai yang terasosiasi

          // Jika wajah sama ditemukan, kembalikan pesan error
          return res.status(400).json({
            message: `Registrasi gagal: Wajah ini sudah terdaftar pada pegawai ${pegawai.nama} (ID: ${pegawai.id_pegawai}). Pendaftaran ulang tidak diizinkan.`,
            success: false,
          });
        }
      }

      // Simpan data wajah baru jika tidak ada wajah yang mirip
      await FaceData.create({
        id_pegawai,
        face_encoding: Buffer.from(JSON.stringify(faceEncodings)), // Simpan semua encoding wajah yang baru
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
    console.error(err); // Cetak error ke console untuk debugging
    res.status(500).json({
      message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
      success: false,
    });
  }
};
