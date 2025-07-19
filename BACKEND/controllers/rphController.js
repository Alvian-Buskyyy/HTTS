const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRPH = async (req, res) => {
  try {
    const rph = await prisma.rPH.findMany();
    res.status(200).json(rph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRPHById = async (req, res) => {
  const { id } = req.params;
  try {
    const rph = await prisma.rPH.findUnique({
      where: { id: parseInt(id) },
    });
    if (rph) {
      res.status(200).json(rph);
    } else {
      res.status(404).json({ error: 'RPH not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRPH = async (req, res) => {
  const { nama, alamat, noTelepon, sertifikatNKV, sertifikatHalal, jumlahPenyelia, namaJuleha, noSertifJuleha, tanggalPenyembelihan } = req.body;
  try {
    const newRPH = await prisma.rPH.create({
      data: { nama, alamat, noTelepon, sertifikatNKV, sertifikatHalal, jumlahPenyelia, namaJuleha, noSertifJuleha, tanggalPenyembelihan },
    });
    res.status(201).json(newRPH);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRPH = async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelepon, sertifikatNKV, sertifikatHalal, jumlahPenyelia, namaJuleha, noSertifJuleha, tanggalPenyembelihan } = req.body;
  try {
    const updatedRPH = await prisma.rPH.update({
      where: { id: parseInt(id) },
      data: { nama, alamat, noTelepon, sertifikatNKV, sertifikatHalal, jumlahPenyelia, namaJuleha, noSertifJuleha, tanggalPenyembelihan },
    });
    res.status(200).json(updatedRPH);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRPH = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.rPH.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};