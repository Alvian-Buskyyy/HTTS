const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();const { getAvailableDagingWeight } = require("../services/dagingAvailabilityService");
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

/**
 * Get daging owned by distributor (from riwayat kepemilikan)
 */
exports.getDistributorDaging = async (req, res) => {
  const { distributorId } = req.params;

  try {
    // Validate distributor exists
    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
    });

    if (!distributor) {
      return res.status(404).json({ error: `Distributor with ID ${distributorId} not found` });
    }

    // Get all riwayat kepemilikan
    const riwayatList = await prisma.riwayatKepemilikanDaging.findMany({
      where: {
        distributorId: distributorId,
      },
      include: {
        daging: {
          include: {
            sapi: true,
            jagal: true,
            rph: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    // Group by dagingId and calculate available weight for each daging
    const dagingMap = new Map();

    for (const riwayat of riwayatList) {
      const dagingId = riwayat.dagingId;

      if (!dagingMap.has(dagingId)) {
        // Use service to get accurate available weight
        const availability = await getAvailableDagingWeight(
          dagingId,
          "DISTRIBUTOR",
          distributorId
        );

        dagingMap.set(dagingId, {
          daging: riwayat.daging,
          totalOwned: availability.totalAwal,
          totalSold: availability.totalTerjual,
          availableWeight: availability.sisaDaging,
          breakdown: availability.breakdown,
          riwayatList: riwayatList.filter((r) => r.dagingId === dagingId),
        });
      }
    }

    const dagingList = Array.from(dagingMap.values()).filter((item) => item.availableWeight > 0);

    res.status(200).json({
      success: true,
      message: "Daging owned by distributor retrieved successfully",
      distributorId,
      count: dagingList.length,
      data: dagingList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};