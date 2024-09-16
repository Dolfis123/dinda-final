const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pegawai = sequelize.define(
  "Pegawai",
  {
    id_pegawai: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nip_nik: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
    },
    tempat_lahir: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tanggal_lahir: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    agama: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pendidikan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    jenis_kelamin: {
      type: DataTypes.ENUM("Laki-Laki", "Perempuan"),
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pangkat_golongan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status_oap: {
      type: DataTypes.ENUM("OAP", "Non OAP"),
      allowNull: true,
    },
    suku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    instansi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "pegawai",
    timestamps: false,
  }
);

module.exports = Pegawai;
