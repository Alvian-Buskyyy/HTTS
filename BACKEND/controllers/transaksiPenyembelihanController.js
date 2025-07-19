const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadToIPFS } = require('../config/ipfs');

exports.getAllTransaksiPenyembelihan = async (req, res) => {
  try {
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findMany();
    res.status(200).json(transaksiPenyembelihan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiPenyembelihanById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: parseInt(id) },
    });
    if (transaksiPenyembelihan) {
      res.status(200).json(transaksiPenyembelihan);
    } else {
      res.status(404).json({ error: 'Transaksi Penyembelihan not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaksiPenyembelihan = async (req, res) => {
  const { rphId, jagalId, distributorId, sapiId, timestamp, cid } = req.body;
  try {
    const transaksiData = { rphId, jagalId, distributorId, sapiId, timestamp };
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    const newTransaksiPenyembelihan = await prisma.transaksiPenyembelihan.create({
      data: { rphId, jagalId, distributorId, sapiId, timestamp, cid },
    });
    res.status(201).json(newTransaksiPenyembelihan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTransaksiPenyembelihan = async (req, res) => {
  const { id } = req.params;
  const { rphId, jagalId, distributorId, sapiId, timestamp } = req.body;
  try {
    const transaksiData = { rphId, jagalId, distributorId, sapiId, timestamp };
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    const updatedTransaksiPenyembelihan = await prisma.transaksiPenyembelihan.update({
      where: { id: parseInt(id) },
      data: { rphId, jagalId, distributorId, sapiId, timestamp, cid },
    });
    res.status(200).json(updatedTransaksiPenyembelihan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaksiPenyembelihan = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.transaksiPenyembelihan.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.convertSapiToDaging = async (req, res) => {
  const { sapiId, rphId, jagalId, distributorId, berat, idPengecekanHalalSehat } = req.body;
  
  try {
    // 1. Validasi entitas yang terlibat
    const sapi = await prisma.sapi.findUnique({
      where: { id: sapiId },
    });
    
    if (!sapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
    }
    
    const rph = await prisma.rPH.findUnique({
      where: { id: rphId },
    });
    
    if (!rph) {
      return res.status(404).json({ error: `RPH dengan ID ${rphId} tidak ditemukan` });
    }
    
    const jagal = await prisma.jagal.findUnique({
      where: { id: jagalId },
    });
    
    if (!jagal) {
      return res.status(404).json({ error: `Jagal dengan ID ${jagalId} tidak ditemukan` });
    }
    
    // if (distributorId) {
    //   const distributor = await prisma.distributor.findUnique({
    //     where: { id: distributorId },
    //   });
      
    //   if (!distributor) {
    //     return res.status(404).json({ error: `Distributor dengan ID ${distributorId} tidak ditemukan` });
    //   }
    // }
    
    // 2. Cek apakah Sapi sudah diproses menjadi daging sebelumnya
    const existingDaging = await prisma.daging.findUnique({
      where: { sapiId },
    });
    
    if (existingDaging) {
      return res.status(400).json({ error: `Sapi dengan ID ${sapiId} telah diproses menjadi daging sebelumnya` });
    }
    
    // 3. Lakukan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (prisma) => {
      const timestamp = new Date();
      
      // 4. Siapkan data transaksi untuk IPFS
      const transaksiData = {
        sapiId,
        rphId,
        jagalId,
        // distributorId,
        berat,
        idPengecekanHalalSehat,
        timestamp,
      };
      
      const transaksiDataString = JSON.stringify(transaksiData);
      const cid = await uploadToIPFS(transaksiDataString);
      
      // 5. Buat record TransaksiPenyembelihan
      const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.create({
        data: {
          rphId,
          jagalId,
          // distributorId,
          sapiId,
          timestamp,
          cid,
        },
      });
      
      // 6. Buat record Daging
      const daging = await prisma.daging.create({
        data: {
          sapiId,
          idPengecekanHalalSehat,
          berat,
        },
      });
      
      // 7. Update record Sapi untuk menunjukkan lokasinya sekarang di RPH
      await prisma.sapi.update({
        where: { id: sapiId },
        data: {
          rphId,
          jagalId,
          // Hapus kepemilikan sebelumnya
          peternakId: null,
          pasarHewanId: null,
        },
      });
      
      return { transaksiPenyembelihan, daging };
    });
    
    res.status(201).json({
      message: "Sapi berhasil dikonversi menjadi daging",
      data: result
    });
  } catch (error) {
    console.error("Error saat mengkonversi Sapi menjadi Daging:", error);
    res.status(500).json({ error: error.message });
  }
};