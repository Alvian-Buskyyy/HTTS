const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllItemSehat = async (req, res) => {
  try {
    const itemSehat = await prisma.itemSehat.findMany();
    res.status(200).json(itemSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItemSehatById = async (req, res) => {
  const { id } = req.params;
  try {
    const itemSehat = await prisma.itemSehat.findUnique({
      where: { id },
    });
    if (itemSehat) {
      res.status(200).json(itemSehat);
    } else {
      res.status(404).json({ error: 'Item Sehat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createItemSehat = async (req, res) => {
  const { nama, deskripsi, kategori } = req.body;
  try {
    const newItemSehat = await prisma.itemSehat.create({
      data: { 
        nama, 
        deskripsi, 
        kategori 
      },
    });
    res.status(201).json(newItemSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItemSehat = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, kategori } = req.body;
  try {
    const updatedItemSehat = await prisma.itemSehat.update({
      where: { id },
      data: { 
        nama, 
        deskripsi, 
        kategori 
      },
    });
    res.status(200).json(updatedItemSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItemSehat = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.itemSehat.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};