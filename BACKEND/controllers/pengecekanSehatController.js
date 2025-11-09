const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadToIPFS } = require('../config/ipfs');

exports.getAllPengecekanSehat = async (req, res) => {
  try {
    const pengecekanSehat = await prisma.pengecekanSehat.findMany();
    res.status(200).json(pengecekanSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPengecekanSehatById = async (req, res) => {
  const { id } = req.params;
  try {
    const pengecekanSehat = await prisma.pengecekanSehat.findUnique({
      where: { id },
    });
    if (pengecekanSehat) {
      res.status(200).json(pengecekanSehat);
    } else {
      res.status(404).json({ error: 'Pengecekan Sehat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPengecekanSehat = async (req, res) => {
  const { sapiId, itemSehatId, boolean, cid, detail } = req.body;
  try {
    // If no CID provided, upload payload to IPFS (align with transaksi penjualan flow)
    let finalCid = cid;
    if (!finalCid) {
      const payload = JSON.stringify({
        sapiId,
        itemSehatId,
        boolean,
        detail: detail || {},
        timestamp: new Date().toISOString()
      });
      finalCid = await uploadToIPFS(payload);
    }

    const newPengecekanSehat = await prisma.pengecekanSehat.create({
      data: {
        boolean,
        cid: finalCid,
        sapi: { connect: { id: sapiId } },
        itemSehat: { connect: { id: itemSehatId } }
      }
    });
    res.status(201).json(newPengecekanSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePengecekanSehat = async (req, res) => {
  const { id } = req.params;
  const { sapiId, itemSehatId, boolean, cid } = req.body;
  try {
    // Only update CID if provided; otherwise keep existing (non-breaking)
    const data = {
      boolean,
      sapi: sapiId ? { connect: { id: sapiId } } : undefined,
      itemSehat: itemSehatId ? { connect: { id: itemSehatId } } : undefined
    };

    if (cid) {
      data.cid = cid;
    }

    const updatedPengecekanSehat = await prisma.pengecekanSehat.update({
      where: { id },
      data
    });
    res.status(200).json(updatedPengecekanSehat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePengecekanSehat = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pengecekanSehat.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};