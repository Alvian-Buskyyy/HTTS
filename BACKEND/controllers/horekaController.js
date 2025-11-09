const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllHoreka = async (req, res) => {
  try {
    const horeka = await prisma.horeka.findMany();
    res.status(200).json(horeka);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHorekaById = async (req, res) => {
  const { id } = req.params;
  try {
    const horeka = await prisma.horeka.findUnique({
      where: { id: parseInt(id) },
    });
    if (horeka) {
      res.status(200).json(horeka);
    } else {
      res.status(404).json({ error: 'Horeka not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHoreka = async (req, res) => {
  const { nama, alamat, noTelepon, tanggalPenerimaan, kondisiProduk } = req.body;
  try {
    const newHoreka = await prisma.horeka.create({
      data: { nama, alamat, noTelepon, tanggalPenerimaan, kondisiProduk },
    });
    res.status(201).json(newHoreka);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHoreka = async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelepon, tanggalPenerimaan, kondisiProduk } = req.body;
  try {
    const updatedHoreka = await prisma.horeka.update({
      where: { id: parseInt(id) },
      data: { nama, alamat, noTelepon, tanggalPenerimaan, kondisiProduk },
    });
    res.status(200).json(updatedHoreka);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHoreka = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.horeka.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};