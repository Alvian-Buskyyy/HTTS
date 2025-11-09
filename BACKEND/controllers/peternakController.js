const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPeternak = async (req, res) => {
  try {
    const peternak = await prisma.peternak.findMany();
    res.status(200).json(peternak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPeternakById = async (req, res) => {
  const { id } = req.params;
  try {
    const peternak = await prisma.peternak.findUnique({
      where: { id: id },
      include: {
        profiles: true
      }
    });
    if (peternak) {
      res.status(200).json(peternak);
    } else {
      res.status(404).json({ error: 'Peternak not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPeternak = async (req, res) => {
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV } = req.body;
  try {
    const newPeternak = await prisma.peternak.create({
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV },
    });
    res.status(201).json(newPeternak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePeternak = async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV } = req.body;
  try {
    const updatedPeternak = await prisma.peternak.update({
      where: { id: parseInt(id) },
      data: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV },
    });
    res.status(200).json(updatedPeternak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePeternak = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.peternak.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get peternak by userId via Profile mapping
exports.getPeternakByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find profile by userId and get linked peternakId
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile || profile.entityType !== 'PETERNAK' || !profile.peternakId) {
      return res.status(404).json({ error: 'Peternak not found for this user' });
    }

    // Load peternak by mapped id
    const peternak = await prisma.peternak.findUnique({
      where: { id: profile.peternakId },
      include: { profiles: true }
    });

    if (!peternak) {
      return res.status(404).json({ error: 'Peternak not found' });
    }

    // Attach minimal user info for convenience
    res.status(200).json({ ...peternak, user: profile.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update peternak by userId via Profile mapping
exports.updatePeternakByUserId = async (req, res) => {
  const { userId } = req.params;
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV } = req.body;
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile || profile.entityType !== 'PETERNAK' || !profile.peternakId) {
      return res.status(404).json({ error: 'Peternak not found for this user' });
    }

    const updatedPeternak = await prisma.peternak.update({
      where: { id: profile.peternakId },
      data: {
        nama,
        alamat,
        noTelepon,
        jumlahSapi: typeof jumlahSapi !== 'undefined' ? parseInt(jumlahSapi) : undefined,
        sertifikatNKV
      },
    });
    res.status(200).json(updatedPeternak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};