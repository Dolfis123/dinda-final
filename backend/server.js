require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const absensiRoutes = require("./routes/absensiRoutes");
const faceDetectionRoutes = require("./routes/faceDetectionRoutes");
const pegawaiRoutes = require("./routes/pegawaiRoutes");
const absensiRoutesCrud = require("./routes/absensiRoutesCrud");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
const sequelize = require("./config/database");

const app = express();
// Middleware
app.use(express.json());
app.use(
  session({
    secret: "secretkey", // Ganti dengan secret yang lebih aman
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

app.use("/api/absensi", absensiRoutes);
app.use("/api/face-detection", faceDetectionRoutes);
app.use("/api/pegawai", pegawaiRoutes);
app.use("/api/absensi-crud", absensiRoutesCrud);
app.use("/auth", authRoutes);

app.post("/api/absensi/absen", (req, res) => {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
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

  const formattedDate = `${hari}, ${tanggal} ${bulan} ${tahun}`;

  res.json({
    success: true,
    nama: "Nama Pegawai",
    message: `Selamat, <em>Nama Pegawai</em>! Absensi Anda pada <em>${formattedDate}</em> telah berhasil dicatat. Terima kasih atas kehadiran Anda dan semoga hari Anda produktif.`,
  });
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
