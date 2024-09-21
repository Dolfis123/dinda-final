const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const Pegawai = require("../models/pegawaiModel");
const FaceData = require("../models/faceDataModel");
const Absensi = require("../models/absensiModel");

// Fungsi untuk menghitung Cosine Similarity antara dua encoding wajah
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
  cosineThreshold = 0.25,
  euclideanThreshold = 0.3
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

exports.absen = async (req, res) => {
  try {
    const imageBase64 = req.body.image;
    const imageBuffer = Buffer.from(imageBase64.split(",")[1], "base64");
    const imagePath = path.join(
      __dirname,
      "../public/images/",
      `temp_${Date.now()}.jpg`
    );
    fs.writeFileSync(imagePath, imageBuffer);

    // Kirim gambar ke server Python untuk mendeteksi wajah dan mendapatkan encoding
    const formData = new FormData();
    formData.append("images", fs.createReadStream(imagePath)); // Append gambar dengan key 'images'

    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/detect-face`,
      formData,
      {
        headers: formData.getHeaders(), // Perbarui headers dengan formData.getHeaders()
      }
    );

    if (!response.data.success) {
      fs.unlinkSync(imagePath);
      return res
        .status(400)
        .json({ message: response.data.message, success: false });
    }

    const faceEncodings = response.data.face_encodings; // Semua encoding yang diterima dari Python
    const faceData = await FaceData.findAll();
    let matchedPegawai = null;

    // Iterasi melalui setiap encoding wajah yang disimpan dalam database
    for (let data of faceData) {
      const storedEncodings = JSON.parse(data.face_encoding.toString());
      let cosineSimilarities = [];
      let euclideanDistances = [];

      // Cek setiap encoding wajah yang baru dengan encoding yang disimpan di database
      for (const encoding of faceEncodings) {
        for (const storedEncoding of storedEncodings) {
          const cosineSimilarityValue = cosineSimilarity(
            storedEncoding,
            encoding
          );
          const euclideanDistanceValue = euclideanDistance(
            storedEncoding,
            encoding
          );

          // Catat setiap nilai untuk dihitung rata-ratanya nanti
          cosineSimilarities.push(cosineSimilarityValue);
          euclideanDistances.push(euclideanDistanceValue);
        }
      }

      // Hitung rata-rata dari similarity values dan distance values
      const averageCosineSimilarity =
        cosineSimilarities.reduce((a, b) => a + b, 0) /
        cosineSimilarities.length;
      const averageEuclideanDistance =
        euclideanDistances.reduce((a, b) => a + b, 0) /
        euclideanDistances.length;

      console.log(`Rata-rata Cosine Similarity: ${averageCosineSimilarity}`);
      console.log(`Rata-rata Euclidean Distance: ${averageEuclideanDistance}`);

      // Jika rata-rata memenuhi threshold, berarti wajahnya dianggap cocok
      if (averageCosineSimilarity > 0.25 && averageEuclideanDistance < 0.3) {
        matchedPegawai = await Pegawai.findByPk(data.id_pegawai);
        break;
      }
    }

    if (!matchedPegawai) {
      fs.unlinkSync(imagePath);
      return res.status(400).json({
        message:
          "Wajah tidak ditemukan dalam database. Silakan mendaftar terlebih dahulu atau hubungi administrator untuk bantuan lebih lanjut.",
        success: false,
      });
    }

    const now = new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const hari = days[now.getDay()];
    const tanggal = now.getDate();
    const bulan = months[now.getMonth()];
    const tahun = now.getFullYear();
    const tanggal_absen = now.toISOString().split("T")[0];
    const waktu_absen = now.toTimeString().split(" ")[0];
    const dateMessage = `${hari}, ${tanggal} ${bulan} ${tahun}`;

    const existingAbsensi = await Absensi.findOne({
      where: {
        id_pegawai: matchedPegawai.id_pegawai,
        tanggal_absen: tanggal_absen,
      },
    });

    if (existingAbsensi) {
      fs.unlinkSync(imagePath);
      return res.status(400).json({
        message: `Hi <em>${matchedPegawai.nama}</em>, absensi Anda untuk hari ini, <em>"${dateMessage}"</em>, telah tercatat. Anda tidak perlu melakukan absensi ulang. Terima kasih atas kedisiplinan Anda.`,
      });
    }

    await Absensi.create({
      id_pegawai: matchedPegawai.id_pegawai,
      tanggal_absen: tanggal_absen,
      waktu_absen: waktu_absen,
      lokasi_absen: null,
      status_absen: "Hadir",
      metode_absen: "Face Detection",
    });

    fs.unlinkSync(imagePath);
    return res.json({
      message: `Selamat, <em>${matchedPegawai.nama}</em>! Absensi Anda pada <em>${dateMessage}</em> telah berhasil dicatat. Terima kasih atas kehadiran Anda dan semoga hari Anda produktif.`,
      success: true,
      nama: matchedPegawai.nama,
    });
  } catch (err) {
    console.error("Error during absensi:", err.message);
    res
      .status(500)
      .json({ message: "Error during absensi", error: err.message });
  }
};
