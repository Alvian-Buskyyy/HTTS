const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Validate entity exists in the system
 * @param {string} entityType - Type of entity (PETERNAK, PASAR_HEWAN, JAGAL, RPH, DISTRIBUTOR, HOREKA, END_CUSTOMER)
 * @param {string} entityId - ID of the entity
 * @param {string} role - Role in transaction (penjual/pembeli)
 * @returns {Promise<Object>} Entity data if valid
 * @throws {Error} If entity not found
 */
async function validateEntity(entityType, entityId, role = "entity") {
  let entity = null;

  switch (entityType) {
    case "PETERNAK":
      entity = await prisma.peternak.findUnique({ where: { id: entityId } });
      break;
    case "PASAR_HEWAN":
      entity = await prisma.pasarHewan.findUnique({ where: { id: entityId } });
      break;
    case "JAGAL":
      entity = await prisma.jagal.findUnique({ where: { id: entityId } });
      break;
    case "RPH":
      entity = await prisma.rPH.findUnique({ where: { id: entityId } });
      break;
    case "DISTRIBUTOR":
      entity = await prisma.distributor.findUnique({ where: { id: entityId } });
      break;
    case "HOREKA":
      entity = await prisma.horeka.findUnique({ where: { id: entityId } });
      break;
    case "END_CUSTOMER":
      entity = await prisma.endCustomer.findUnique({ where: { id: entityId } });
      break;
    default:
      throw new Error(`Tipe entitas ${entityType} tidak valid`);
  }

  if (!entity) {
    throw new Error(`${entityType} dengan ID ${entityId} tidak ditemukan (${role})`);
  }

  return entity;
}

module.exports = {
  validateEntity,
};
