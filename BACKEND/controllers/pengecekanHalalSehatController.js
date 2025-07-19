const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPengecekanHalalSehat = async (req, res) => {
  try {
    const pengecekanHalalSehat = await prisma.pengecekanHalalSehat.findMany();
    res.status(200).json(pengecekanHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPengecekanHalalSehatById = async (req, res) => {
  const { id } = req.params;
  try {
    const pengecekanHalalSehat = await prisma.pengecekanHalalSehat.findUnique({
      where: { id },
    });
    if (pengecekanHalalSehat) {
      res.status(200).json(pengecekanHalalSehat);
    } else {
      res.status(404).json({ error: 'Pengecekan Halal Sehat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPengecekanHalalSehat = async (req, res) => {
  const { sapiId, itemHalalSehatId, boolean, cid } = req.body;
  try {
    const newPengecekanHalalSehat = await prisma.pengecekanHalalSehat.create({
      data: {
        boolean,
        cid,
        sapi: {
          connect: { id: sapiId }
        },
        itemHalalSehat: {
          connect: { id: itemHalalSehatId }
        }
      }
    });
    res.status(201).json(newPengecekanHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePengecekanHalalSehat = async (req, res) => {
  const { id } = req.params;
  const { sapiId, itemHalalSehatId, boolean, cid } = req.body;
  try {
    const updatedPengecekanHalalSehat = await prisma.pengecekanHalalSehat.update({
      where: { id },
      data: {
        boolean,
        cid,
        sapi: sapiId ? {
          connect: { id: sapiId }
        } : undefined,
        itemHalalSehat: itemHalalSehatId ? {
          connect: { id: itemHalalSehatId }
        } : undefined
      }
    });
    res.status(200).json(updatedPengecekanHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePengecekanHalalSehat = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pengecekanHalalSehat.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};