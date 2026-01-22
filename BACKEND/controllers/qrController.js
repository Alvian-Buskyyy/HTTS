const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const prisma = new PrismaClient();

exports.getAllQRs = async (req, res) => {
  try {
    const qrs = await prisma.qR.findMany();
    res.status(200).json(qrs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }solve 
};

exports.getQRById = async (req, res) => {
  const { id } = req.params;
  try {
    const qr = await prisma.qR.findUnique({
      where: { id: parseInt(id) },
    });
    if (qr) {
      res.status(200).json(qr);
    } else {
      res.status(404).json({ error: 'QR not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate QR Code untuk Sapi atau Daging
exports.generateQR = async (req, res) => {
  const { sapiId, dagingId } = req.body;
  
  try {
    if (!sapiId && !dagingId) {
      return res.status(400).json({ error: 'sapiId atau dagingId harus diisi' });
    }
    
    // Validate sapi or daging exists
    if (sapiId) {
      const sapi = await prisma.sapi.findUnique({ 
        where: { id: sapiId },
        include: {
          peternak: true,
          pasarHewan: true,
          transaksiPenjualan: true,
          pengecekanSehat: true,
          pengecekanHalalSehat: true,
        }
      });
      
      if (!sapi) {
        return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
      }
      
      // Generate QR data URL with complete traceability info
      const qrData = {
        type: 'SAPI',
        id: sapiId,
        jenis: sapi.jenis,
        usia: sapi.usia,
        kelamin: sapi.kelamin,
        beratSapi: sapi.beratSapi,
        asalType: sapi.asalType,
        asalId: sapi.asalId,
        traceUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/sapi/${sapiId}`
      };
      
      const qrDataString = JSON.stringify(qrData);
      
      // Generate QR Code with better options
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('QR Code generated for Sapi:', sapiId);
      console.log('QR Data URL length:', qrCodeDataURL.length);
      console.log('QR Data URL prefix:', qrCodeDataURL.substring(0, 50));
      
      // Save QR to database
      const newQR = await prisma.qR.create({
        data: { 
          sapiId, 
          urlQR: qrCodeDataURL,
        },
      });
      
      return res.status(201).json({
        message: 'QR Code berhasil dibuat untuk Sapi',
        qr: newQR,
        qrCode: qrCodeDataURL,  // Frontend expects 'qrCode'
        qrImage: qrCodeDataURL, // Keep for backward compatibility
      });
    }
    
    if (dagingId) {
      const daging = await prisma.daging.findUnique({ 
        where: { id: dagingId },
        include: {
          sapi: {
            include: {
              peternak: true,
              pasarHewan: true,
              transaksiPenjualan: true,
              transaksiPenyembelihan: true,
              pengecekanSehat: true,
              pengecekanHalalSehat: true,
            }
          }
        }
      });
      
      if (!daging) {
        return res.status(404).json({ error: `Daging dengan ID ${dagingId} tidak ditemukan` });
      }
      
      // Generate QR data URL with complete traceability info
      const qrData = {
        type: 'DAGING',
        id: dagingId,
        berat: daging.berat,
        sapiId: daging.sapiId,
        sapiJenis: daging.sapi.jenis,
        traceUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/daging/${dagingId}`
      };
      
      const qrDataString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString);
      
      // Save QR to database
      const newQR = await prisma.qR.create({
        data: { 
          dagingId, 
          urlQR: qrCodeDataURL,
        },
      });
      
      return res.status(201).json({
        message: 'QR Code berhasil dibuat untuk Daging',
        qr: newQR,
        qrCode: qrCodeDataURL,  // Frontend expects 'qrCode'
        qrImage: qrCodeDataURL, // Keep for backward compatibility
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createQR = async (req, res) => {
  const { sapiId, dagingId, urlQR } = req.body;
  try {
    const newQR = await prisma.qR.create({
      data: { sapiId, dagingId, urlQR },
    });
    res.status(201).json(newQR);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQR = async (req, res) => {
  const { id } = req.params;
  const { sapiId, dagingId, urlQR } = req.body;
  try {
    const updatedQR = await prisma.qR.update({
      where: { id: parseInt(id) },
      data: { sapiId, dagingId, urlQR },
    });
    res.status(200).json(updatedQR);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQR = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.qR.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Track riwayat kepemilikan dan transaksi sapi
 * GET /qr/sapi/:sapiId/track
 */
exports.trackSapi = async (req, res) => {
  try {
    const { sapiId } = req.params;

    // Get sapi detail
    const sapi = await prisma.sapi.findUnique({
      where: { id: sapiId },
      include: {
        peternak: true,
        pasarHewan: true,
        jagal: true,
        pengecekanSehat: {
          include: {
            itemSehat: true
          }
        },
        pengecekanHalalSehat: {
          include: {
            itemHalalSehat: true
          }
        }
      }
    });

    if (!sapi) {
      return res.status(404).json({
        success: false,
        error: 'Sapi tidak ditemukan'
      });
    }

    // Get transaction history
    const transactions = await prisma.transaksiPenjualan.findMany({
      where: { sapiId: sapiId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        penjualType: true,
        penjualId: true,
        pembeliType: true,
        pembeliId: true,
        timestamp: true,
        verificationStatus: true,
        cid: true,
        notes: true
      }
    });

    // Enrich transactions with entity names
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const sellerName = await getEntityName(tx.penjualType, tx.penjualId);
        const buyerName = await getEntityName(tx.pembeliType, tx.pembeliId);

        return {
          id: tx.id,
          date: tx.timestamp,
          fromEntity: tx.penjualType,
          fromName: sellerName,
          toEntity: tx.pembeliType,
          toName: buyerName,
          verified: tx.verificationStatus === 'VERIFIED',
          cid: tx.cid,
          notes: tx.notes
        };
      })
    );

    // Determine current owner
    let currentOwner = {
      type: sapi.asalType,
      id: sapi.asalId,
      name: await getEntityName(sapi.asalType, sapi.asalId)
    };

    if (sapi.peternakId) {
      currentOwner = {
        type: 'PETERNAK',
        id: sapi.peternakId,
        name: sapi.peternak?.nama || sapi.peternakId
      };
    } else if (sapi.pasarHewanId) {
      currentOwner = {
        type: 'PASAR_HEWAN',
        id: sapi.pasarHewanId,
        name: sapi.pasarHewan?.nama || sapi.pasarHewanId
      };
    } else if (sapi.jagalId) {
      currentOwner = {
        type: 'JAGAL',
        id: sapi.jagalId,
        name: sapi.jagal?.nama || sapi.jagalId
      };
    }

    // Check health status
    const healthChecks = sapi.pengecekanSehat.map(check => ({
      item: check.itemSehat.nama,
      status: check.boolean,
      category: check.itemSehat.kategori
    }));

    const halalHealthChecks = sapi.pengecekanHalalSehat.map(check => ({
      item: check.itemHalalSehat.nama,
      status: check.boolean,
      category: check.itemHalalSehat.kategori
    }));

    res.json({
      success: true,
      data: {
        sapi: {
          id: sapi.id,
          jenis: sapi.jenis,
          kelamin: sapi.kelamin,
          usia: sapi.usia,
          berat: sapi.beratSapi,
          isProcessed: sapi.isProcessed,
          processedAt: sapi.processedAt
        },
        currentOwner,
        history: enrichedTransactions,
        healthStatus: {
          sehat: healthChecks,
          halalSehat: halalHealthChecks
        }
      }
    });
  } catch (error) {
    console.error('Error tracking sapi:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal melacak riwayat sapi'
    });
  }
};

/**
 * Track riwayat kepemilikan dan transaksi daging
 * GET /qr/daging/:dagingId/track
 */
exports.trackDaging = async (req, res) => {
  try {
    const { dagingId } = req.params;

    // Get daging detail
    const daging = await prisma.daging.findUnique({
      where: { id: dagingId },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        distributor: true,
        horeka: true,
        endCustomer: true,
        transaksiPenyembelihan: {
          include: {
            checklist: {
              include: {
                itemChecklist: true
              }
            }
          }
        }
      }
    });

    if (!daging) {
      return res.status(404).json({
        success: false,
        error: 'Daging tidak ditemukan'
      });
    }

    // Build history starting from slaughter
    const history = [];

    // Add slaughter record
    if (daging.transaksiPenyembelihan) {
      const tx = daging.transaksiPenyembelihan;
      history.push({
        id: tx.id,
        date: tx.tanggalPenyembelihan || tx.timestamp,
        type: 'slaughter',
        fromEntity: 'JAGAL',
        fromName: daging.jagal?.nama || daging.jagalId,
        toEntity: 'RPH',
        toName: daging.rph?.nama || daging.rphId,
        verified: tx.status === 'VERIFIED',
        cid: tx.cid,
        details: {
          beratDaging: tx.beratDaging,
          beratJeroan: tx.beratJeroan,
          beratTulang: tx.beratTulang,
          totalBerat: tx.totalBerat,
          checklistPra: tx.checklistPraLengkap,
          checklistPasca: tx.checklistPascaLengkap
        }
      });
    }

    // Get sales transactions
    const transactions = await prisma.transaksiPenjualan.findMany({
      where: { dagingId: dagingId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        penjualType: true,
        penjualId: true,
        pembeliType: true,
        pembeliId: true,
        timestamp: true,
        verificationStatus: true,
        cid: true,
        beratDaging: true,
        beratJeroan: true,
        beratTulang: true,
        totalBerat: true,
        notes: true
      }
    });

    // Enrich sales transactions
    for (const tx of transactions) {
      const sellerName = await getEntityName(tx.penjualType, tx.penjualId);
      const buyerName = await getEntityName(tx.pembeliType, tx.pembeliId);

      history.push({
        id: tx.id,
        date: tx.timestamp,
        type: 'sale',
        fromEntity: tx.penjualType,
        fromName: sellerName,
        toEntity: tx.pembeliType,
        toName: buyerName,
        verified: tx.verificationStatus === 'VERIFIED',
        cid: tx.cid,
        details: {
          beratDaging: tx.beratDaging,
          beratJeroan: tx.beratJeroan,
          beratTulang: tx.beratTulang,
          totalBerat: tx.totalBerat
        },
        notes: tx.notes
      });
    }

    // Determine current owner
    let currentOwner = {
      type: 'JAGAL',
      id: daging.jagalId,
      name: daging.jagal?.nama || daging.jagalId
    };

    if (daging.endCustomerId) {
      currentOwner = {
        type: 'END_CUSTOMER',
        id: daging.endCustomerId,
        name: daging.endCustomer?.nama || daging.endCustomerId
      };
    } else if (daging.horekaId) {
      currentOwner = {
        type: 'HOREKA',
        id: daging.horekaId,
        name: daging.horeka?.nama || daging.horekaId
      };
    } else if (daging.distributorId) {
      currentOwner = {
        type: 'DISTRIBUTOR',
        id: daging.distributorId,
        name: daging.distributor?.namaUsaha || daging.distributorId
      };
    }

    // Halal certification status
    const halalStatus = {
      status: daging.statusHalal,
      verifiedAt: daging.verifiedAt,
      verifikasiJagal: daging.verifikasiJagal,
      verifikasiRegulator: daging.verifikasiRegulator
    };

    res.json({
      success: true,
      data: {
        daging: {
          id: daging.id,
          sapiId: daging.sapiId,
          beratDaging: daging.beratDaging,
          beratJeroan: daging.beratJeroan,
          beratTulang: daging.beratTulang,
          totalBerat: daging.totalBerat,
          sudahDijual: daging.sudahDijual
        },
        sapi: {
          id: daging.sapi.id,
          jenis: daging.sapi.jenis,
          kelamin: daging.sapi.kelamin,
          usia: daging.sapi.usia,
          berat: daging.sapi.beratSapi
        },
        rph: {
          id: daging.rphId,
          nama: daging.rph?.nama || daging.rphId,
          sertifikatHalal: daging.rph?.sertifikatHalal
        },
        currentOwner,
        halalStatus,
        history
      }
    });
  } catch (error) {
    console.error('Error tracking daging:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal melacak riwayat daging'
    });
  }
};

/**
 * Helper function to get entity name by type and ID
 */
async function getEntityName(type, id) {
  try {
    let entity;
    switch (type) {
      case 'PETERNAK':
        entity = await prisma.peternak.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      case 'PASAR_HEWAN':
        entity = await prisma.pasarHewan.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      case 'JAGAL':
        entity = await prisma.jagal.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      case 'RPH':
        entity = await prisma.rph.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      case 'DISTRIBUTOR':
        entity = await prisma.distributor.findUnique({ where: { id }, select: { namaUsaha: true } });
        return entity?.namaUsaha || id;
      case 'HOREKA':
        entity = await prisma.horeka.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      case 'END_CUSTOMER':
        entity = await prisma.endCustomer.findUnique({ where: { id }, select: { nama: true } });
        return entity?.nama || id;
      default:
        return id;
    }
  } catch (error) {
    console.error('Error getting entity name:', error);
    return id;
  }
}