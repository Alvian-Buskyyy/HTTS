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

exports.createSapi = async (req, res) => {
  const { usia, jenis, kelamin, peternakId, pasarHewanId, jagalId, rphId } = req.body;
  
  try {
    // Validate that referenced entities exist
    if (peternakId) {
      const peternak = await prisma.peternak.findUnique({
        where: { id: peternakId },
      });
      if (!peternak) {
        return res.status(404).json({ error: `Peternak with ID ${peternakId} not found` });
      }
    }

    if (pasarHewanId) {
      const pasarHewan = await prisma.pasarHewan.findUnique({
        where: { id: pasarHewanId },
      });
      if (!pasarHewan) {
        return res.status(404).json({ error: `Pasar Hewan with ID ${pasarHewanId} not found` });
      }
    }

    if (jagalId) {
      const jagal = await prisma.jagal.findUnique({
        where: { id: jagalId },
      });
      if (!jagal) {
        return res.status(404).json({ error: `Jagal with ID ${jagalId} not found` });
      }
    }

    if (rphId) {
      const rph = await prisma.rPH.findUnique({
        where: { id: rphId },
      });
      if (!rph) {
        return res.status(404).json({ error: `RPH with ID ${rphId} not found` });
      }
    }

    // Create sapi record if all validations pass
    const newSapi = await prisma.sapi.create({
      data: { usia, jenis, kelamin, peternakId, pasarHewanId, jagalId, rphId },
    });
    
    res.status(201).json(newSapi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSapi = async (req, res) => {
  const { id } = req.params;
  const { usia, jenis, kelamin, peternakId, pasarHewanId, jagalId, rphId } = req.body;
  
  try {
    // Check if the sapi exists
    const existingSapi = await prisma.sapi.findUnique({
      where: { id },
    });
    
    if (!existingSapi) {
      return res.status(404).json({ error: `Sapi with ID ${id} not found` });
    }
    
    // Validate that referenced entities exist
    if (peternakId) {
      const peternak = await prisma.peternak.findUnique({
        where: { id: peternakId },
      });
      if (!peternak) {
        return res.status(404).json({ error: `Peternak with ID ${peternakId} not found` });
      }
    }

    if (pasarHewanId) {
      const pasarHewan = await prisma.pasarHewan.findUnique({
        where: { id: pasarHewanId },
      });
      if (!pasarHewan) {
        return res.status(404).json({ error: `Pasar Hewan with ID ${pasarHewanId} not found` });
      }
    }

    if (jagalId) {
      const jagal = await prisma.jagal.findUnique({
        where: { id: jagalId },
      });
      if (!jagal) {
        return res.status(404).json({ error: `Jagal with ID ${jagalId} not found` });
      }
    }

    if (rphId) {
      const rph = await prisma.rPH.findUnique({
        where: { id: rphId },
      });
      if (!rph) {
        return res.status(404).json({ error: `RPH with ID ${rphId} not found` });
      }
    }

    const updatedSapi = await prisma.sapi.update({
      where: { id },
      data: { usia, jenis, kelamin, peternakId, pasarHewanId, jagalId, rphId },
    });
    
    res.status(200).json(updatedSapi);
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
      return res.status(404).json({ error: `Sapi with ID ${id} not found` });
    }
    
    await prisma.sapi.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};