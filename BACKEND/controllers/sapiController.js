const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSapi = async (req, res) => {
  try {
    const sapi = await prisma.sapi.findMany();
    res.status(200).json(sapi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSapiById = async (req, res) => {
  const { id } = req.params;
  try {
    const sapi = await prisma.sapi.findUnique({
      where: { id },
    });
    if (sapi) {
      res.status(200).json(sapi);
    } else {
      res.status(404).json({ error: 'Sapi not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan sapi berdasarkan entitas pemilik
exports.getSapiByEntity = async (req, res) => {
  const { entityType, entityId } = req.params;
  
  try {
    let sapi = [];
    
    switch (entityType) {
      case 'PETERNAK':
        sapi = await prisma.sapi.findMany({
          where: { peternakId: entityId },
          include: {
            peternak: true,
            transaksiPenjualan: true,
            pengecekanSehat: true,
          }
        });
        break;
      case 'PASAR_HEWAN':
        sapi = await prisma.sapi.findMany({
          where: { pasarHewanId: entityId },
          include: {
            pasarHewan: true,
            transaksiPenjualan: true,
            pengecekanSehat: true,
          }
        });
        break;
      default:
        return res.status(400).json({ error: 'Entity type tidak valid' });
    }
    
    res.status(200).json(sapi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSapi = async (req, res) => {
  const { usia, jenis, kelamin, beratSapi, asalType, asalId, peternakId } = req.body;
  
  try {
    // Validate that the origin entity exists
    let originEntity = null;
    
    if (!asalType || !asalId) {
      return res.status(400).json({ error: 'asalType dan asalId harus diisi' });
    }

    // Validate origin entity exists in database
    switch (asalType) {
      case 'PETERNAK':
        originEntity = await prisma.peternak.findUnique({ where: { id: asalId } });
        if (!originEntity) {
          return res.status(404).json({ error: `Peternak dengan ID ${asalId} tidak ditemukan` });
        }
        break;
      case 'PASAR_HEWAN':
        originEntity = await prisma.pasarHewan.findUnique({ where: { id: asalId } });
        if (!originEntity) {
          return res.status(404).json({ error: `Pasar Hewan dengan ID ${asalId} tidak ditemukan` });
        }
        break;
      default:
        return res.status(400).json({ error: 'asalType harus PETERNAK atau PASAR_HEWAN untuk pembuatan sapi baru' });
    }

    // Validate current owner if provided
    if (peternakId) {
      const peternak = await prisma.peternak.findUnique({
        where: { id: peternakId },
      });
      if (!peternak) {
        return res.status(404).json({ error: `Peternak dengan ID ${peternakId} tidak ditemukan` });
      }
    }

    // Create sapi record and update jumlahSapi in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sapi record
      const newSapi = await tx.sapi.create({
        data: { 
          usia, 
          jenis, 
          kelamin, 
          beratSapi,
          asalType,
          asalId,
          peternakId: peternakId || (asalType === 'PETERNAK' ? asalId : null),
          pasarHewanId: asalType === 'PASAR_HEWAN' ? asalId : null
        },
      });
      
      // Update jumlahSapi for owner entity
      if (asalType === 'PETERNAK') {
        await tx.peternak.update({
          where: { id: asalId },
          data: { jumlahSapi: { increment: 1 } }
        });
      } else if (asalType === 'PASAR_HEWAN') {
        await tx.pasarHewan.update({
          where: { id: asalId },
          data: { jumlahSapi: { increment: 1 } }
        });
      }
      
      return newSapi;
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSapi = async (req, res) => {
  const { id } = req.params;
  const { usia, jenis, kelamin, beratSapi, peternakId, pasarHewanId } = req.body;
  
  try {
    // Check if the sapi exists
    const existingSapi = await prisma.sapi.findUnique({
      where: { id },
    });
    
    if (!existingSapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${id} tidak ditemukan` });
    }
    
    // Validate that referenced entities exist
    if (peternakId) {
      const peternak = await prisma.peternak.findUnique({
        where: { id: peternakId },
      });
      if (!peternak) {
        return res.status(404).json({ error: `Peternak dengan ID ${peternakId} tidak ditemukan` });
      }
    }

    if (pasarHewanId) {
      const pasarHewan = await prisma.pasarHewan.findUnique({
        where: { id: pasarHewanId },
      });
      if (!pasarHewan) {
        return res.status(404).json({ error: `Pasar Hewan dengan ID ${pasarHewanId} tidak ditemukan` });
      }
    }

    // Update sapi and adjust jumlahSapi counts in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Track if ownership changed
      const oldPeternakId = existingSapi.peternakId;
      const oldPasarHewanId = existingSapi.pasarHewanId;
      
      // Update sapi
      const updatedSapi = await tx.sapi.update({
        where: { id },
        data: { usia, jenis, kelamin, beratSapi, peternakId, pasarHewanId },
      });
      
      // Adjust jumlahSapi if ownership changed
      // Decrement old owner
      if (oldPeternakId && oldPeternakId !== peternakId) {
        await tx.peternak.update({
          where: { id: oldPeternakId },
          data: { jumlahSapi: { decrement: 1 } }
        });
      }
      if (oldPasarHewanId && oldPasarHewanId !== pasarHewanId) {
        await tx.pasarHewan.update({
          where: { id: oldPasarHewanId },
          data: { jumlahSapi: { decrement: 1 } }
        });
      }
      
      // Increment new owner
      if (peternakId && peternakId !== oldPeternakId) {
        await tx.peternak.update({
          where: { id: peternakId },
          data: { jumlahSapi: { increment: 1 } }
        });
      }
      if (pasarHewanId && pasarHewanId !== oldPasarHewanId) {
        await tx.pasarHewan.update({
          where: { id: pasarHewanId },
          data: { jumlahSapi: { increment: 1 } }
        });
      }
      
      return updatedSapi;
    });
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSapi = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the sapi exists
    const existingSapi = await prisma.sapi.findUnique({
      where: { id },
    });
    
    if (!existingSapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${id} tidak ditemukan` });
    }
    
    // Delete sapi and update jumlahSapi in transaction
    await prisma.$transaction(async (tx) => {
      // Delete sapi
      await tx.sapi.delete({
        where: { id },
      });
      
      // Decrement jumlahSapi for owner entity
      if (existingSapi.peternakId) {
        await tx.peternak.update({
          where: { id: existingSapi.peternakId },
          data: { jumlahSapi: { decrement: 1 } }
        });
      }
      if (existingSapi.pasarHewanId) {
        await tx.pasarHewan.update({
          where: { id: existingSapi.pasarHewanId },
          data: { jumlahSapi: { decrement: 1 } }
        });
      }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};