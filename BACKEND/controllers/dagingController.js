const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDaging = async (req, res) => {
  try {
    const daging = await prisma.daging.findMany();
    res.status(200).json(daging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDagingById = async (req, res) => {
  const { id } = req.params;
  try {
    const daging = await prisma.daging.findUnique({
      where: { id },
    });
    if (daging) {
      res.status(200).json(daging);
    } else {
      res.status(404).json({ error: 'Daging not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDaging = async (req, res) => {
  const { sapiId, idPengecekanHalalSehat, berat } = req.body;
  try {
    const newDaging = await prisma.daging.create({
      data: { sapiId, idPengecekanHalalSehat, berat },
    });
    res.status(201).json(newDaging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDaging = async (req, res) => {
  const { id } = req.params;
  const { sapiId, idPengecekanHalalSehat, berat } = req.body;
  try {
    const updatedDaging = await prisma.daging.update({
      where: { id },
      data: { sapiId, idPengecekanHalalSehat, berat },
    });
    res.status(200).json(updatedDaging);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDaging = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.daging.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};