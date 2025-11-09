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
      where: { id: id },
      include: {
        profiles: true
      }
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
      where: { id: id },
      data: {
        nama,
        alamat,
        noTelepon,
        sertifikatNKV,
        jumlahSapi: jumlahSapi !== undefined ? parseInt(jumlahSapi) : undefined,
        jumlahDaging: jumlahDaging !== undefined ? parseInt(jumlahDaging) : undefined,
      },
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
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get jagal by userId
exports.getJagalByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Map userId -> jagalId via Profile (karena Jagal tidak punya field userId)
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });

    const mappedJagalId = profile?.jagalId || profile?.user?.jagalId || null;

    if (!mappedJagalId) {
      return res.status(404).json({ error: 'Mapping jagalId untuk user ini tidak ditemukan' });
    }

    const jagal = await prisma.jagal.findUnique({
      where: { id: mappedJagalId },
      include: {
        profiles: {
          include: { user: true }
        }
      }
    });

    if (!jagal) {
      return res.status(404).json({ error: 'Jagal not found' });
    }

    res.status(200).json(jagal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update jagal by userId
exports.updateJagalByUserId = async (req, res) => {
  const { userId } = req.params;
  const { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV, jumlahDaging } = req.body;
  try {
    // Temukan jagalId dari Profile atau relasi User
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });

    const mappedJagalId = profile?.jagalId || profile?.user?.jagalId || null;

    if (!mappedJagalId) {
      return res.status(404).json({ error: 'Mapping jagalId untuk user ini tidak ditemukan' });
    }

    const updatedJagal = await prisma.jagal.update({
      where: { id: mappedJagalId },
      data: {
        nama,
        alamat,
        noTelepon,
        sertifikatNKV,
        jumlahSapi: jumlahSapi !== undefined ? parseInt(jumlahSapi) : undefined,
        jumlahDaging: jumlahDaging !== undefined ? parseInt(jumlahDaging) : undefined,
      },
    });

    res.status(200).json(updatedJagal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};