// controllers/absensiController.js

const Absensi = require("../models/Absensi");
const Pegawai = require("../models/pegawaiModel");

// Mendapatkan semua data absensi dengan informasi pegawai
exports.getAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.findAll({
      include: {
        model: Pegawai,
        attributes: ["nama", "nip_nik", "jenis_kelamin"],
      },
    });
    res.json(absensi);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data absensi", success: false });
  }
};

// Menambahkan data absensi baru
exports.createAbsensi = async (req, res) => {
  const {
    id_pegawai,
    tanggal_absen,
    waktu_absen, // Ini mungkin null dari frontend
    lokasi_absen,
    status_absen,
    metode_absen,
  } = req.body;

  try {
    const now = new Date();
    const formattedWaktuAbsen = waktu_absen || now.toTimeString().split(" ")[0]; // Otomatis isi waktu absen jika tidak disediakan

    // Cek jika pegawai sudah absen hari ini, dan ambil juga informasi pegawainya
    const existingAbsensi = await Absensi.findOne({
      where: {
        id_pegawai,
        tanggal_absen: now.toISOString().split("T")[0], // Cek berdasarkan tanggal hari ini
      },
      include: {
        model: Pegawai, // Sertakan data pegawai
        attributes: ["nama"], // Hanya ambil nama pegawai
      },
    });

    if (existingAbsensi) {
      return res.status(400).json({
        message: `
          <p>Hi <strong>${existingAbsensi.Pegawai.nama}</strong>,</p>
          <p>Absensi Anda untuk hari ini, <em>${existingAbsensi.tanggal_absen}</em>, telah tercatat.</p>
          <p>Anda tidak perlu melakukan absensi ulang. Terima kasih atas kedisiplinan Anda.</p>
        `,
        success: false,
      });
    }

    // Buat data absensi baru
    const newAbsensi = await Absensi.create({
      id_pegawai,
      tanggal_absen: now.toISOString().split("T")[0], // Isi tanggal otomatis
      waktu_absen: formattedWaktuAbsen, // Gunakan waktu otomatis jika tidak ada
      lokasi_absen,
      status_absen,
      metode_absen: metode_absen || "Manual", // Default ke Manual jika tidak ada metode absen
    });

    res.status(201).json({
      message: "Absensi berhasil dicatat.",
      success: true,
      data: newAbsensi,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal menambahkan data absensi", success: false });
  }
};

// Mengupdate data absensi
exports.updateAbsensi = async (req, res) => {
  const { id_absensi } = req.params;
  const {
    tanggal_absen,
    waktu_absen,
    lokasi_absen,
    status_absen,
    metode_absen,
  } = req.body;
  try {
    const updatedAbsensi = await Absensi.update(
      {
        tanggal_absen,
        waktu_absen,
        lokasi_absen,
        status_absen,
        metode_absen,
      },
      {
        where: { id_absensi },
      }
    );
    res.json({ message: "Data absensi berhasil diupdate", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal mengupdate data absensi", success: false });
  }
};

// Menghapus data absensi
exports.deleteAbsensi = async (req, res) => {
  const { id_absensi } = req.params;
  try {
    await Absensi.destroy({ where: { id_absensi } });
    res.json({ message: "Data absensi berhasil dihapus", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal menghapus data absensi", success: false });
  }
};
