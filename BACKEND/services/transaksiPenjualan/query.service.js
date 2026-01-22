const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get incoming transactions for an entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array>} List of incoming transactions
 */
async function getIncomingTransactions(entityType, entityId) {
  return prisma.transaksiPenjualan.findMany({
    where: {
      pembeliType: entityType,
      pembeliId: entityId,
    },
    include: {
      sapi: {
        include: {
          peternak: true,
          pasarHewan: true,
          jagal: true,
        },
      },
      daging: {
        include: {
          sapi: true,
          jagal: true,
          distributor: true,
          horeka: true,
          endCustomer: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

/**
 * Get outgoing transactions for an entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array>} List of outgoing transactions
 */
async function getOutgoingTransactions(entityType, entityId) {
  return prisma.transaksiPenjualan.findMany({
    where: {
      penjualType: entityType,
      penjualId: entityId,
    },
    include: {
      sapi: {
        include: {
          peternak: true,
          pasarHewan: true,
          jagal: true,
        },
      },
      daging: {
        include: {
          sapi: true,
          jagal: true,
          distributor: true,
          horeka: true,
          endCustomer: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

/**
 * Get all transactions for a specific entity (both incoming and outgoing)
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Object>} Object with incoming and outgoing transactions
 */
async function getAllEntityTransactions(entityType, entityId) {
  const [incoming, outgoing] = await Promise.all([
    getIncomingTransactions(entityType, entityId),
    getOutgoingTransactions(entityType, entityId),
  ]);

  return {
    incoming,
    outgoing,
    total: incoming.length + outgoing.length,
  };
}

module.exports = {
  getIncomingTransactions,
  getOutgoingTransactions,
  getAllEntityTransactions,
};
