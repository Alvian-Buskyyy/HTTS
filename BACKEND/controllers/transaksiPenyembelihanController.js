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
  const { penyembelihType, penyembelihId, penerimaType, penerimaId, sapiId } = req.body;
  
  try {
    // Validasi entitas penyembelih
    let penyembelih = null;
    if (penyembelihType === 'JAGAL') {
      penyembelih = await prisma.jagal.findUnique({ where: { id: penyembelihId } });
      if (!penyembelih) {
        return res.status(404).json({ error: `Jagal dengan ID ${penyembelihId} tidak ditemukan dalam sistem` });
      }
    } else if (penyembelihType === 'RPH') {
      penyembelih = await prisma.rPH.findUnique({ where: { id: penyembelihId } });
      if (!penyembelih) {
        return res.status(404).json({ error: `RPH dengan ID ${penyembelihId} tidak ditemukan dalam sistem` });
      }
    } else {
      return res.status(400).json({ error: 'penyembelihType harus JAGAL atau RPH' });
    }
    
    // Validasi entitas penerima
    let penerima = null;
    if (penerimaType === 'DISTRIBUTOR') {
      penerima = await prisma.distributor.findUnique({ where: { id: penerimaId } });
      if (!penerima) {
        return res.status(404).json({ error: `Distributor dengan ID ${penerimaId} tidak ditemukan dalam sistem` });
      }
    } else if (penerimaType === 'HOREKA') {
      penerima = await prisma.horeka.findUnique({ where: { id: penerimaId } });
      if (!penerima) {
        return res.status(404).json({ error: `Horeka dengan ID ${penerimaId} tidak ditemukan dalam sistem` });
      }
    } else {
      return res.status(400).json({ error: 'penerimaType harus DISTRIBUTOR atau HOREKA' });
    }
    
    // Validasi sapi
    const sapi = await prisma.sapi.findUnique({ where: { id: sapiId } });
    if (!sapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
    }
    
    // Cek apakah sapi sudah disembelih
    const existingDaging = await prisma.daging.findUnique({ where: { sapiId } });
    if (existingDaging) {
      return res.status(400).json({ error: `Sapi dengan ID ${sapiId} sudah disembelih sebelumnya` });
    }
    
    // Prepare data untuk IPFS
    const timestamp = new Date();
    const transaksiData = { 
      penyembelihType, 
      penyembelihId, 
      penerimaType, 
      penerimaId, 
      sapiId, 
      timestamp: timestamp.toISOString() 
    };
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    const newTransaksiPenyembelihan = await prisma.transaksiPenyembelihan.create({
      data: { 
        penyembelihType, 
        penyembelihId, 
        penerimaType, 
        penerimaId, 
        sapiId, 
        timestamp, 
        cid 
      },
    });
    
    res.status(201).json({
      message: 'Transaksi penyembelihan berhasil dibuat dan disimpan ke IPFS',
      data: newTransaksiPenyembelihan,
      ipfsCid: cid,
    });
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
  const { sapiId, penyembelihType, penyembelihId, penerimaType, penerimaId, berat, idPengecekanHalalSehat } = req.body;
  
  try {
    // 1. Validasi sapi
    const sapi = await prisma.sapi.findUnique({
      where: { id: sapiId },
      include: {
        peternak: true,
        pasarHewan: true,
        pengecekanHalalSehat: true,
      }
    });
    
    if (!sapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
    }
    
    // 2. Validasi pengecekan halal sehat sudah dilakukan
    if (idPengecekanHalalSehat) {
      const pengecekan = await prisma.pengecekanHalalSehat.findUnique({
        where: { id: idPengecekanHalalSehat },
      });
      
      if (!pengecekan) {
        return res.status(404).json({ error: `Pengecekan Halal Sehat dengan ID ${idPengecekanHalalSehat} tidak ditemukan` });
      }
      
      if (pengecekan.sapiId !== sapiId) {
        return res.status(400).json({ error: `Pengecekan Halal Sehat tidak sesuai dengan sapi yang akan disembelih` });
      }
    }
    
    // 3. Validasi entitas penyembelih
    let penyembelih = null;
    if (penyembelihType === 'JAGAL') {
      penyembelih = await prisma.jagal.findUnique({ where: { id: penyembelihId } });
      if (!penyembelih) {
        return res.status(404).json({ error: `Jagal dengan ID ${penyembelihId} tidak ditemukan dalam sistem` });
      }
    } else if (penyembelihType === 'RPH') {
      penyembelih = await prisma.rPH.findUnique({ where: { id: penyembelihId } });
      if (!penyembelih) {
        return res.status(404).json({ error: `RPH dengan ID ${penyembelihId} tidak ditemukan dalam sistem` });
      }
    } else {
      return res.status(400).json({ error: 'penyembelihType harus JAGAL atau RPH' });
    }
    
    // 4. Validasi entitas penerima
    let penerima = null;
    if (penerimaType === 'DISTRIBUTOR') {
      penerima = await prisma.distributor.findUnique({ where: { id: penerimaId } });
      if (!penerima) {
        return res.status(404).json({ error: `Distributor dengan ID ${penerimaId} tidak ditemukan dalam sistem` });
      }
    } else if (penerimaType === 'HOREKA') {
      penerima = await prisma.horeka.findUnique({ where: { id: penerimaId } });
      if (!penerima) {
        return res.status(404).json({ error: `Horeka dengan ID ${penerimaId} tidak ditemukan dalam sistem` });
      }
    } else if (penerimaType === 'RPH' && penyembelihType === 'JAGAL') {
      // Jagal bisa mengirim ke RPH
      penerima = await prisma.rPH.findUnique({ where: { id: penerimaId } });
      if (!penerima) {
        return res.status(404).json({ error: `RPH dengan ID ${penerimaId} tidak ditemukan dalam sistem` });
      }
    } else {
      return res.status(400).json({ error: 'penerimaType tidak valid untuk penyembelihType yang dipilih' });
    }
    
    // 5. Cek apakah Sapi sudah diproses menjadi daging sebelumnya
    const existingDaging = await prisma.daging.findUnique({
      where: { sapiId },
    });
    
    if (existingDaging) {
      return res.status(400).json({ error: `Sapi dengan ID ${sapiId} telah diproses menjadi daging sebelumnya` });
    }
    
    // 6. Lakukan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (prisma) => {
      const timestamp = new Date();
      
      // 7. Siapkan data transaksi untuk IPFS
      const transaksiData = {
        sapiId,
        penyembelihType,
        penyembelihId,
        penerimaType,
        penerimaId,
        berat,
        idPengecekanHalalSehat,
        timestamp: timestamp.toISOString(),
      };
      
      const transaksiDataString = JSON.stringify(transaksiData);
      const cid = await uploadToIPFS(transaksiDataString);
      
      // 8. Buat record TransaksiPenyembelihan
      const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.create({
        data: {
          penyembelihType,
          penyembelihId,
          penerimaType,
          penerimaId,
          sapiId,
          timestamp,
          cid,
        },
      });
      
      // 9. Buat record Daging
      const daging = await prisma.daging.create({
        data: {
          sapiId,
          berat,
        },
      });
      
      // 10. Update record Sapi untuk menghapus kepemilikan
      await prisma.sapi.update({
        where: { id: sapiId },
        data: {
          peternakId: null,
          pasarHewanId: null,
        },
      });
      
      return { transaksiPenyembelihan, daging, cid };
    });
    
    res.status(201).json({
      message: "Sapi berhasil dikonversi menjadi daging dan disimpan ke IPFS",
      data: result.transaksiPenyembelihan,
      daging: result.daging,
      ipfsCid: result.cid
    });
  } catch (error) {
    console.error("Error saat mengkonversi Sapi menjadi Daging:", error);
    res.status(500).json({ error: error.message });
  }
};