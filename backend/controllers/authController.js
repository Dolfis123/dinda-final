const bcrypt = require("bcrypt");
const Login = require("../models/loginModels");
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email:", email); // Tambahkan log ini untuk melihat apakah email diterima dengan benar
  console.log("Password:", password);

  if (!email || !password) {
    return res
      .status(400)
      .json({ Status: "Error", Error: "Email or password missing" });
  }

  try {
    const user = await Login.findOne({ where: { email } });

    if (!user) {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (passwordMatches) {
      req.session.loggedin = true;
      req.session.userId = user.email;
      return res.json({ Status: "Success" });
    } else {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    return res.status(500).json({ Status: "Error", Error: "Error in server" });
  }
};

// Untuk mendaftarkan pengguna baru
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ Status: "Error", Error: "Email or password missing" });
  }

  try {
    // Meng-hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyimpan data ke database
    const newUser = await Login.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ Status: "Success", User: newUser });
  } catch (err) {
    console.error("Error executing query:", err);
    return res.status(500).json({ Status: "Error", Error: "Error in server" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
};
