// models/Absensi.js

const { DataTypes } = require("sequelize");
const db = require("../config/database");
const Pegawai = require("./pegawaiModel");

const Absensi = db.define(
  "absensi",
  {
    id_absensi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pegawai: {
      type: DataTypes.INTEGER,
      references: {
        model: Pegawai, // Relasi dengan tabel Pegawai
        key: "id_pegawai",
      },
    },
    tanggal_absen: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    waktu_absen: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    lokasi_absen: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true,
    },
    status_absen: {
      type: DataTypes.ENUM("Hadir", "Izin", "Sakit", "Alpa"),
      allowNull: true,
    },
    metode_absen: {
      type: DataTypes.ENUM("Face Detection", "Manual"),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "absensi",
    timestamps: false,
  }
);

// Definisikan relasi dengan Pegawai
Absensi.belongsTo(Pegawai, { foreignKey: "id_pegawai" });

module.exports = Absensi;
