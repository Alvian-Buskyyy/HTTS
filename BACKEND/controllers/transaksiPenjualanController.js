const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadToIPFS } = require('../config/ipfs');

exports.getAllTransaksiPenjualan = async (req, res) => {
  try {
    const transaksiPenjualan = await prisma.transaksiPenjualan.findMany();
    res.status(200).json(transaksiPenjualan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiPenjualanById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaksiPenjualan = await prisma.transaksiPenjualan.findUnique({
      where: { id },
    });
    if (transaksiPenjualan) {
      res.status(200).json(transaksiPenjualan);
    } else {
      res.status(404).json({ error: 'Transaksi Penjualan not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaksiPenjualan = async (req, res) => {
  const { 
    penjualType, pembeliType, penjualId, pembeliId,
    sapiId, dagingId, jumlahQty, type
  } = req.body;
  
  try {
    // Helper function untuk validasi entitas
    const validateEntity = async (entityType, entityId, role) => {
      let entity = null;
      const errorPrefix = role === 'penjual' ? 'Penjual' : 'Pembeli';
      
      switch (entityType) {
        case 'PETERNAK':
          entity = await prisma.peternak.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Peternak dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case 'PASAR_HEWAN':
          entity = await prisma.pasarHewan.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Pasar Hewan dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case 'JAGAL':
          entity = await prisma.jagal.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Jagal dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case 'RPH':
          entity = await prisma.rPH.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} RPH dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case 'DISTRIBUTOR':
          entity = await prisma.distributor.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Distributor dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case 'HOREKA':
          entity = await prisma.horeka.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Horeka dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        default:
          throw new Error(`Tipe entitas ${entityType} tidak valid`);
      }
      
      return entity;
    };

    // Validate penjual exists in system
    await validateEntity(penjualType, penjualId, 'penjual');
    
    // Validate pembeli exists in system
    await validateEntity(pembeliType, pembeliId, 'pembeli');

    // Validate item being sold
    if (sapiId) {
      const sapi = await prisma.sapi.findUnique({ 
        where: { id: sapiId },
        include: {
          peternak: true,
          pasarHewan: true,
          pengecekanSehat: true,
        }
      });
      if (!sapi) {
        return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
      }
    }
    
    if (dagingId) {
      const daging = await prisma.daging.findUnique({ 
        where: { id: dagingId },
        include: {
          sapi: true,
        }
      });
      if (!daging) {
        return res.status(404).json({ error: `Daging dengan ID ${dagingId} tidak ditemukan` });
      }
    }

    if (!sapiId && !dagingId) {
      return res.status(400).json({ error: 'sapiId atau dagingId harus diisi' });
    }

    // Prepare transaction data for IPFS
    const timestamp = new Date();
    const transaksiData = {
      penjualType,
      penjualId,
      pembeliType,
      pembeliId,
      sapiId,
      dagingId,
      jumlahQty,
      type,
      timestamp: timestamp.toISOString(),
    };
    
    // Upload to IPFS
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    // Create transaction record
    const newTransaksiPenjualan = await prisma.transaksiPenjualan.create({
      data: {
        penjualType, 
        penjualId,
        pembeliType,
        pembeliId,
        sapiId,
        dagingId, 
        jumlahQty, 
        type, 
        timestamp,
        cid
      },
    });
    
    // Update ownership of sapi or daging
    if (sapiId) {
      const updateData = {};
      
      // Clear old ownership
      updateData.peternakId = null;
      updateData.pasarHewanId = null;
      
      // Set new ownership based on pembeli type
      if (pembeliType === 'PETERNAK') {
        updateData.peternakId = pembeliId;
      } else if (pembeliType === 'PASAR_HEWAN') {
        updateData.pasarHewanId = pembeliId;
      }
      
      await prisma.sapi.update({
        where: { id: sapiId },
        data: updateData,
      });
    }
    
    res.status(201).json({
      message: 'Transaksi penjualan berhasil dibuat dan disimpan ke IPFS',
      data: newTransaksiPenjualan,
      ipfsCid: cid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaksiPenjualan = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the transaction exists
    const existingTransaksi = await prisma.transaksiPenjualan.findUnique({
      where: { id },
    });
    
    if (!existingTransaksi) {
      return res.status(404).json({ error: `Transaksi Penjualan with ID ${id} not found` });
    }
    
    // Delete the transaction
    await prisma.transaksiPenjualan.delete({
      where: { id },
    });
    
    res.status(204).send(); // No content response for successful deletion
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};