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
    penjualType, pembeliType,
    peternakPenjualId, pasarHewanPenjualId, jagalPenjualId, rphPenjualId, distributorPenjualId, horekaPenjualId,
    peternakPembeliId, pasarHewanPembeliId, jagalPembeliId, rphPembeliId, distributorPembeliId, horekaPembeliId,
    sapiId, dagingId, jumlahQty, pengecekanSehatId, type, timestamp
  } = req.body;
  
  try {
    // Validate penjual ID exists
    let penjualExists = false;
    if (penjualType === 'PETERNAK' && peternakPenjualId) {
      const penjual = await prisma.peternak.findUnique({ where: { id: peternakPenjualId } });
      if (!penjual) return res.status(404).json({ error: `Peternak seller with ID ${peternakPenjualId} not found` });
      penjualExists = true;
    } else if (penjualType === 'PASAR_HEWAN' && pasarHewanPenjualId) {
      const penjual = await prisma.pasarHewan.findUnique({ where: { id: pasarHewanPenjualId } });
      if (!penjual) return res.status(404).json({ error: `PasarHewan seller with ID ${pasarHewanPenjualId} not found` });
      penjualExists = true;
    } else if (penjualType === 'JAGAL' && jagalPenjualId) {
      const penjual = await prisma.jagal.findUnique({ where: { id: jagalPenjualId } });
      if (!penjual) return res.status(404).json({ error: `Jagal seller with ID ${jagalPenjualId} not found` });
      penjualExists = true;
    } else if (penjualType === 'RPH' && rphPenjualId) {
      const penjual = await prisma.rPH.findUnique({ where: { id: rphPenjualId } });
      if (!penjual) return res.status(404).json({ error: `RPH seller with ID ${rphPenjualId} not found` });
      penjualExists = true;
    } else if (penjualType === 'DISTRIBUTOR' && distributorPenjualId) {
      const penjual = await prisma.distributor.findUnique({ where: { id: distributorPenjualId } });
      if (!penjual) return res.status(404).json({ error: `Distributor seller with ID ${distributorPenjualId} not found` });
      penjualExists = true;
    } else if (penjualType === 'HOREKA' && horekaPenjualId) {
      const penjual = await prisma.horeka.findUnique({ where: { id: horekaPenjualId } });
      if (!penjual) return res.status(404).json({ error: `Horeka seller with ID ${horekaPenjualId} not found` });
      penjualExists = true;
    }
    
    if (!penjualExists) {
      return res.status(400).json({ error: 'Invalid or missing seller type and ID' });
    }

    // Validate pembeli ID exists
    let pembeliExists = false;
    if (pembeliType === 'PETERNAK' && peternakPembeliId) {
      const pembeli = await prisma.peternak.findUnique({ where: { id: peternakPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `Peternak buyer with ID ${peternakPembeliId} not found` });
      pembeliExists = true;
    } else if (pembeliType === 'PASAR_HEWAN' && pasarHewanPembeliId) {
      const pembeli = await prisma.pasarHewan.findUnique({ where: { id: pasarHewanPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `PasarHewan buyer with ID ${pasarHewanPembeliId} not found` });
      pembeliExists = true;
    } else if (pembeliType === 'JAGAL' && jagalPembeliId) {
      const pembeli = await prisma.jagal.findUnique({ where: { id: jagalPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `Jagal buyer with ID ${jagalPembeliId} not found` });
      pembeliExists = true;
    } else if (pembeliType === 'RPH' && rphPembeliId) {
      const pembeli = await prisma.rPH.findUnique({ where: { id: rphPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `RPH buyer with ID ${rphPembeliId} not found` });
      pembeliExists = true;
    } else if (pembeliType === 'DISTRIBUTOR' && distributorPembeliId) {
      const pembeli = await prisma.distributor.findUnique({ where: { id: distributorPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `Distributor buyer with ID ${distributorPembeliId} not found` });
      pembeliExists = true;
    } else if (pembeliType === 'HOREKA' && horekaPembeliId) {
      const pembeli = await prisma.horeka.findUnique({ where: { id: horekaPembeliId } });
      if (!pembeli) return res.status(404).json({ error: `Horeka buyer with ID ${horekaPembeliId} not found` });
      pembeliExists = true;
    }
    
    if (!pembeliExists) {
      return res.status(400).json({ error: 'Invalid or missing buyer type and ID' });
    }

    // Validate item being sold
    if (sapiId) {
      const sapi = await prisma.sapi.findUnique({ where: { id: sapiId } });
      if (!sapi) return res.status(404).json({ error: `Sapi with ID ${sapiId} not found` });
    }
    
    if (dagingId) {
      const daging = await prisma.daging.findUnique({ where: { id: dagingId } });
      if (!daging) return res.status(404).json({ error: `Daging with ID ${dagingId} not found` });
    }

    if (!sapiId && !dagingId) {
      return res.status(400).json({ error: 'Either sapiId or dagingId must be provided' });
    }

    // Store transaction in IPFS and database
    const transaksiData = req.body;
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    const newTransaksiPenjualan = await prisma.transaksiPenjualan.create({
      data: {
        penjualType, 
        pembeliType,
        peternakPenjualId, 
        pasarHewanPenjualId, 
        jagalPenjualId, 
        rphPenjualId, 
        distributorPenjualId, 
        horekaPenjualId,
        peternakPembeliId, 
        pasarHewanPembeliId, 
        jagalPembeliId, 
        rphPembeliId, 
        distributorPembeliId, 
        horekaPembeliId,
        sapiId,
        dagingId, 
        jumlahQty, 
        pengecekanSehatId, 
        type, 
        timestamp: new Date(timestamp || Date.now()),
        cid
      },
    });
    res.status(201).json(newTransaksiPenjualan);
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