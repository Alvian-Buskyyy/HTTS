const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRegulators = async (req, res) => {
  try {
    const regulators = await prisma.regulator.findMany();
    res.status(200).json(regulators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRegulatorById = async (req, res) => {
  const { id } = req.params;
  try {
    const regulator = await prisma.regulator.findUnique({
      where: { id },
    });
    if (regulator) {
      res.status(200).json(regulator);
    } else {
      res.status(404).json({ error: 'Regulator not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRegulator = async (req, res) => {
  const { nama, instansi, jabatan } = req.body;
  try {
    const newRegulator = await prisma.regulator.create({
      data: { 
        nama, 
        instansi, 
        jabatan 
      },
    });
    res.status(201).json(newRegulator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRegulator = async (req, res) => {
  const { id } = req.params;
  const { nama, instansi, jabatan } = req.body;
  try {
    const updatedRegulator = await prisma.regulator.update({
      where: { id },
      data: { 
        nama, 
        instansi, 
        jabatan 
      },
    });
    res.status(200).json(updatedRegulator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRegulator = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.regulator.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};