const Absensi = require("../models/Absensi");
const Pegawai = require("../models/pegawaiModel");

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

// Mendapatkan semua data absensi dengan informasi pegawai
exports.createAbsensi = async (req, res) => {
  const {
    id_pegawai,
    tanggal_absen,
    waktu_absen,
    lokasi_absen,
    status_absen,
    metode_absen,
    shift_absen,
  } = req.body;

  try {
    const now = new Date();
    const formattedWaktuAbsen = waktu_absen || now.toTimeString().split(" ")[0];
    const formattedTanggalAbsen =
      tanggal_absen || now.toISOString().split("T")[0];

    // Tentukan batas waktu untuk setiap shift
    const shiftWaktu = {
      "Tanpa Shift": { start: "07:00:00", end: "11:15:00" },
      JP: { start: "06:50:00", end: "11:15:00" },
      "H & JP": { start: "10:00:00", end: "14:15:00" },
      JS: { start: "14:00:00", end: "16:15:00" }, // JS = Jaga Sore
      JSM: { start: "16:00:00", end: "00:15:00" }, // Jaga Sore-Malam
      JM: { start: "16:00:00", end: "00:15:00" }, // Jaga Malam
      JP: { start: "06:50:00", end: "11:15:00" }, // Jaga Malam
    };

    // Cek apakah shift yang diberikan ada dalam daftar
    if (!shiftWaktu[shift_absen]) {
      return res.status(400).json({
        message: "Shift absen tidak valid",
        success: false,
      });
    }

    // Cek apakah waktu absen sesuai dengan jangkauan waktu shift yang dipilih
    const { start, end } = shiftWaktu[shift_absen];
    if (formattedWaktuAbsen < start || formattedWaktuAbsen > end) {
      return res.status(400).json({
        message: `Waktu absensi tidak sesuai dengan jangkauan shift ${shift_absen}`,
        success: false,
      });
    }

    // Cek jika pegawai sudah absen hari ini
    const existingAbsensi = await Absensi.findOne({
      where: {
        id_pegawai,
        tanggal_absen: formattedTanggalAbsen,
      },
      include: {
        model: Pegawai,
        attributes: ["nama"],
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
      tanggal_absen: formattedTanggalAbsen,
      waktu_absen: formattedWaktuAbsen,
      lokasi_absen,
      status_absen,
      metode_absen: metode_absen || "Manual",
      shift_absen,
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
