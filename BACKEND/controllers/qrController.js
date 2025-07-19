const { PrismaClient } = require('@prisma/client');
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