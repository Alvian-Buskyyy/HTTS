const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDaging = async (req, res) => {
  try {
    const daging = await prisma.daging.findMany({
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: true,
        transaksiPenjualan: true,
        qr: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(daging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDagingById = async (req, res) => {
  const { id } = req.params;
  try {
    const daging = await prisma.daging.findUnique({
      where: { id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: {
          include: {
            checklist: {
              include: {
                itemChecklist: true,
              },
            },
          },
        },
        transaksiPenjualan: true,
        qr: true,
      },
    });
    if (daging) {
      res.status(200).json(daging);
    } else {
      res.status(404).json({ error: 'Daging not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDaging = async (req, res) => {
  const { sapiId, idPengecekanHalalSehat, berat } = req.body;
  try {
    const newDaging = await prisma.daging.create({
      data: { sapiId, idPengecekanHalalSehat, berat },
    });
    res.status(201).json(newDaging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDaging = async (req, res) => {
  const { id } = req.params;
  const { sapiId, idPengecekanHalalSehat, berat } = req.body;
  try {
    const updatedDaging = await prisma.daging.update({
      where: { id },
      data: { sapiId, idPengecekanHalalSehat, berat },
    });
    res.status(200).json(updatedDaging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDaging = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.daging.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDagingByJagalId = async (req, res) => {
  try {
    const { jagalId } = req.params;
    
    const dagingList = await prisma.daging.findMany({
      where: {
        jagalId: jagalId
      },
      include: {
        sapi: {
          select: {
            id: true,
            jenis: true,
            beratSapi: true,
            usia: true,
            kelamin: true
          }
        },
        rph: {
          select: {
            id: true,
            nama: true
          }
        },
        transaksiPenyembelihan: {
          select: {
            id: true,
            status: true
          }
        },
        transaksiPenjualan: {
          select: {
            id: true,
            pembeliType: true,
            verificationStatus: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter hanya daging yang VERIFIED dan belum dijual
    const availableDaging = dagingList.filter(d => 
      d.statusHalal === 'VERIFIED' && 
      (!d.transaksiPenjualan || d.transaksiPenjualan.length === 0)
    );

    res.status(200).json({
      success: true,
      data: availableDaging,
      total: dagingList.length,
      available: availableDaging.length
    });
  } catch (error) {
    console.error('Error fetching daging by jagalId:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data daging',
      details: error.message
    });
  }
};