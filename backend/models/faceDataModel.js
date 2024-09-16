const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Pegawai = require("./pegawaiModel"); // Import model Pegawai

// Tentukan nama tabel secara eksplisit menggunakan opsi `tableName`
const FaceData = sequelize.define(
  "FaceData",
  {
    id_face_data: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pegawai: DataTypes.INTEGER,
    face_encoding: DataTypes.BLOB,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "face_data", // Nama tabel yang ada di database
    timestamps: false, // Jika tabel tidak memiliki kolom `createdAt` dan `updatedAt`
  }
);
// Tambahkan relasi antara FaceData dan Pegawai
FaceData.belongsTo(Pegawai, { foreignKey: "id_pegawai" });

module.exports = FaceData;
