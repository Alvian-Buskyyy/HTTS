const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDistributors = async (req, res) => {
  try {
    const distributors = await prisma.distributor.findMany();
    res.status(200).json(distributors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Distributor by userId (mapping via Profile/User)
exports.getDistributorByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Invalid userId' });

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile || profile.entityType !== 'DISTRIBUTOR' || !profile.distributorId) {
      return res.status(404).json({ error: 'Distributor mapping not found for this user' });
    }

    const distributor = await prisma.distributor.findUnique({
      where: { id: profile.distributorId },
      include: { profiles: { include: { user: true } } }
    });

    if (!distributor) return res.status(404).json({ error: 'Distributor not found' });
    res.status(200).json(distributor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDistributorById = async (req, res) => {
  const { id } = req.params;
  try {
    const distributor = await prisma.distributor.findUnique({
      where: { id: parseInt(id) },
    });
    if (distributor) {
      res.status(200).json(distributor);
    } else {
      res.status(404).json({ error: 'Distributor not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDistributor = async (req, res) => {
  const { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan } = req.body;
  try {
    const newDistributor = await prisma.distributor.create({
      data: { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan },
    });
    res.status(201).json(newDistributor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDistributor = async (req, res) => {
  const { id } = req.params;
  const { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan } = req.body;
  try {
    const updatedDistributor = await prisma.distributor.update({
      where: { id: parseInt(id) },
      data: { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan },
    });
    res.status(200).json(updatedDistributor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Distributor by userId (mapping via Profile/User)
exports.updateDistributorByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Invalid userId' });

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile || profile.entityType !== 'DISTRIBUTOR' || !profile.distributorId) {
      return res.status(404).json({ error: 'Distributor mapping not found for this user' });
    }

    const { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan } = req.body;
    const updatedDistributor = await prisma.distributor.update({
      where: { id: profile.distributorId },
      data: { namaUsaha, alamat, noTelepon, tanggalPenerimaan, kondisiProduk, fasilitasPenyimpanan },
    });

    res.status(200).json(updatedDistributor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDistributor = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.distributor.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};