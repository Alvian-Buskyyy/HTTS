const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllItemHalalSehat = async (req, res) => {
  try {
    const itemHalalSehat = await prisma.itemHalalSehat.findMany();
    res.status(200).json(itemHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItemHalalSehatById = async (req, res) => {
  const { id } = req.params;
  try {
    const itemHalalSehat = await prisma.itemHalalSehat.findUnique({
      where: { id },
    });
    if (itemHalalSehat) {
      res.status(200).json(itemHalalSehat);
    } else {
      res.status(404).json({ error: 'Item Halal Sehat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createItemHalalSehat = async (req, res) => {
  const { nama, deskripsi, kategori } = req.body;
  try {
    const newItemHalalSehat = await prisma.itemHalalSehat.create({
      data: { 
        nama, 
        deskripsi, 
        kategori 
      },
    });
    res.status(201).json(newItemHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItemHalalSehat = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, kategori } = req.body;
  try {
    const updatedItemHalalSehat = await prisma.itemHalalSehat.update({
      where: { id },
      data: { 
        nama, 
        deskripsi, 
        kategori 
      },
    });
    res.status(200).json(updatedItemHalalSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItemHalalSehat = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.itemHalalSehat.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};