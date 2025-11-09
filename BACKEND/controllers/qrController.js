const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const prisma = new PrismaClient();

exports.getAllQRs = async (req, res) => {
  try {
    const qrs = await prisma.qR.findMany();
    res.status(200).json(qrs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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