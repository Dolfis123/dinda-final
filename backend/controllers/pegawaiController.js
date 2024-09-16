const Pegawai = require("../models/pegawaiModel");

// Create Pegawai
exports.createPegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.create(req.body);
    res.status(201).json({
      message: "Pegawai created successfully",
      data: pegawai,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating Pegawai", error });
  }
};

// Read All Pegawai
exports.getAllPegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.findAll();
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Pegawai", error });
  }
};

// Read Pegawai by ID
exports.getPegawaiById = async (req, res) => {
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (pegawai) {
      res.status(200).json(pegawai);
    } else {
      res.status(404).json({ message: "Pegawai not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Pegawai", error });
  }
};

// Update Pegawai
exports.updatePegawai = async (req, res) => {
  try {
    const [updated] = await Pegawai.update(req.body, {
      where: { id_pegawai: req.params.id },
    });
    if (updated) {
      const updatedPegawai = await Pegawai.findByPk(req.params.id);
      res.status(200).json({
        message: "Pegawai updated successfully",
        data: updatedPegawai,
      });
    } else {
      res.status(404).json({ message: "Pegawai not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating Pegawai", error });
  }
};

// Delete Pegawai
exports.deletePegawai = async (req, res) => {
  try {
    const deleted = await Pegawai.destroy({
      where: { id_pegawai: req.params.id },
    });
    if (deleted) {
      res.status(200).json({ message: "Pegawai deleted successfully" });
    } else {
      res.status(404).json({ message: "Pegawai not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting Pegawai", error });
  }
};
