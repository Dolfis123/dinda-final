const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Login = db.define(
  "Login",
  {
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      primaryKey: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "login",
    timestamps: false, // Menghilangkan createdAt dan updatedAt
  }
);

module.exports = Login;
