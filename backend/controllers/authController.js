const Login = require("../models/loginModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Fungsi login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah user dengan email tersebut ada
    const user = await Login.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "email tidak ditemukan" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token berlaku selama 1 jam
    );

    return res.json({
      message: "Login berhasil",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Kesalahan di server saat login:", err.message); // Logging error
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

// Fungsi registrasi
exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userExists = await Login.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await Login.create({
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
};
// Fungsi untuk mengedit user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body; // Remove 'role' from the destructuring

  try {
    // Cari user berdasarkan ID
    const user = await Login.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Validasi email baru
    if (email) {
      const emailExists = await Login.findOne({ where: { email } });
      if (emailExists && emailExists.id !== user.id) {
        return res
          .status(400)
          .json({ message: "Email sudah digunakan oleh pengguna lain" });
      }
      user.email = email; // Update email
    }

    // Jika password diupdate, hash ulang
    if (password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    // Simpan perubahan
    await user.save();

    return res.status(200).json({ message: "User berhasil diperbarui", user });
  } catch (err) {
    console.error("Kesalahan saat memperbarui user:", err.message);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

// Fungsi untuk menghapus user
exports.deleteUser = async (req, res) => {
  const { id } = req.params; // Mengambil id user dari parameter

  try {
    // Cari user berdasarkan ID
    const user = await Login.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Hapus user
    await user.destroy();

    return res.status(200).json({ message: "User berhasil dihapus" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

// Fungsi untuk mendapatkan user berdasarkan role
// Fungsi untuk mendapatkan user dengan role 'pegawai' saja
exports.getUsersByRole = async (req, res) => {
  try {
    // Cari user dengan role 'pegawai'
    const users = await Login.findAll({ where: { role: "pegawai" } });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "User dengan role 'pegawai' tidak ditemukan" });
    }

    return res.status(200).json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: err.message });
  }
};
