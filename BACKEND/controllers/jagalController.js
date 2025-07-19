const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllJagal = async (req, res) => {
  try {
    const jagal = await prisma.jagal.findMany();
    res.status(200).json(jagal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJagalById = async (req, res) => {
  const { id } = req.params;
  try {
    const jagal = await prisma.jagal.findUnique({
      where: { id: parseInt(id) },
    });
    if (jagal) {
      res.status(200).json(jagal);
    } else {
      res.status(404).json({ error: 'Jagal not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createJagal = async (req, res) => {
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV, jumlahDaging } = req.body;
  try {
    const newJagal = await prisma.jagal.create({
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV, jumlahDaging },
    });
    res.status(201).json(newJagal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJagal = async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV, jumlahDaging } = req.body;
  try {
    const updatedJagal = await prisma.jagal.update({
      where: { id: parseInt(id) },
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV, jumlahDaging },
    });
    res.status(200).json(updatedJagal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJagal = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.jagal.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};