const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Pegawai = require("../models/pegawaiModel");
const FaceData = require("../models/faceDataModel");
const Absensi = require("../models/absensiModel");

// Fungsi untuk menghitung jarak Euclidean antara dua encoding wajah
function compareFaceEncodings(encoding1, encoding2) {
  if (encoding1.length !== encoding2.length) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < encoding1.length; i++) {
    sum += Math.pow(encoding1[i] - encoding2[i], 2);
  }
  const distance = Math.sqrt(sum);

  const threshold = 0.6;
  return distance < threshold;
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

    const formData = { image: fs.createReadStream(imagePath) };
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/detect-face`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (!response.data.success) {
      fs.unlinkSync(imagePath);
      return res
        .status(400)
        .json({ message: response.data.message, success: false });
    }

    const faceEncoding = response.data.face_encoding;
    const faceData = await FaceData.findAll();
    let matchedPegawai = null;

    for (let data of faceData) {
      const storedEncoding = JSON.parse(data.face_encoding.toString());
      if (compareFaceEncodings(storedEncoding, faceEncoding)) {
        matchedPegawai = await Pegawai.findByPk(data.id_pegawai);
        break;
      }
    }

    if (!matchedPegawai) {
      fs.unlinkSync(imagePath);
      const responseObjectWajahTidakTerdeteksi = {
        message:
          "Wajah tidak ditemukan dalam database. Silakan mendaftar terlebih dahulu atau hubungi administrator untuk bantuan lebih lanjut.",

        success: false,
        status: 400,
      };

      console.log(responseObjectWajahTidakTerdeteksi); // Untuk melihat status di console

      return res
        .status(responseObjectWajahTidakTerdeteksi.status)
        .json(responseObjectWajahTidakTerdeteksi);
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
    const bulan = months[now.getMonth()]; // Bulan dalam string
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
