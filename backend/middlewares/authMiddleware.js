const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan data pengguna ke `req.user`
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

// Middleware untuk validasi peran admin
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak, hanya admin yang dapat mengakses" });
  }
  next();
};

// Middleware untuk validasi peran pegawai
exports.pegawaiMiddleware = (req, res, next) => {
  if (req.user.role !== "pegawai") {
    return res
      .status(403)
      .json({ message: "Akses ditolak, hanya pegawai yang dapat mengakses" });
  }
  next();
};
