const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Absensi = sequelize.define(
  "Absensi",
  {
    id_absensi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pegawai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_absen: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    waktu_absen: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    lokasi_absen: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true,
    },
    status_absen: {
      type: DataTypes.ENUM("Hadir", "Izin", "Sakit", "Alpa"),
      allowNull: false,
    },
    metode_absen: {
      type: DataTypes.ENUM("Face Detection", "Manual"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "absensi",
    timestamps: false,
  }
);

module.exports = Absensi;
