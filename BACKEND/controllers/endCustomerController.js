const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllEndCustomers = async (req, res) => {
  try {
    const endCustomers = await prisma.endCustomer.findMany();
    res.json(endCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEndCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const endCustomer = await prisma.endCustomer.findUnique({
      where: { id: parseInt(id) },
    });
    if (endCustomer) {
      res.json(endCustomer);
    } else {
      res.status(404).json({ error: 'EndCustomer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEndCustomer = async (req, res) => {
  try {
    const newEndCustomer = await prisma.endCustomer.create({
      data: req.body,
    });
    res.status(201).json(newEndCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEndCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEndCustomer = await prisma.endCustomer.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedEndCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEndCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.endCustomer.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};