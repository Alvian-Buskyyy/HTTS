const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPasarHewan = async (req, res) => {
  try {
    const pasarHewan = await prisma.pasarHewan.findMany();
    res.status(200).json(pasarHewan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPasarHewanById = async (req, res) => {
  const { id } = req.params;
  try {
    const pasarHewan = await prisma.pasarHewan.findUnique({
      where: { id: parseInt(id) },
    });
    if (pasarHewan) {
      res.status(200).json(pasarHewan);
    } else {
      res.status(404).json({ error: 'Pasar Hewan not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPasarHewan = async (req, res) => {
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV } = req.body;
  try {
    const newPasarHewan = await prisma.pasarHewan.create({
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV },
    });
    res.status(201).json(newPasarHewan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePasarHewan = async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV } = req.body;
  try {
    const updatedPasarHewan = await prisma.pasarHewan.update({
      where: { id: parseInt(id) },
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV },
    });
    res.status(200).json(updatedPasarHewan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePasarHewan = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pasarHewan.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};