const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Transfer sapi ownership after transaction verification
 * @param {Object} transaction - Transaction data
 * @returns {Promise<void>}
 */
async function transferSapiOwnership(transaction) {
  const { sapiId, pembeliType, pembeliId, penjualType, penjualId, jumlahQty } = transaction;

  // Update sapi ownership
  await prisma.sapi.update({
    where: { id: sapiId },
    data: {
      peternakId: pembeliType === "PETERNAK" ? pembeliId : null,
      pasarHewanId: pembeliType === "PASAR_HEWAN" ? pembeliId : null,
      jagalId: pembeliType === "JAGAL" ? pembeliId : null,
      asalType: penjualType,
      asalId: penjualId,
    },
  });

  // Update entity sapi counts
  await updateEntitySapiCount(penjualType, penjualId, -jumlahQty);
  await updateEntitySapiCount(pembeliType, pembeliId, jumlahQty);
}

/**
 * Update entity sapi count
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {number} change - Change amount (positive for increment, negative for decrement)
 * @returns {Promise<void>}
 */
async function updateEntitySapiCount(entityType, entityId, change) {
  const updateData = change > 0 
    ? { jumlahSapi: { increment: Math.abs(change) } }
    : { jumlahSapi: { decrement: Math.abs(change) } };

  switch (entityType) {
    case "PETERNAK":
      await prisma.peternak.update({ where: { id: entityId }, data: updateData });
      break;
    case "PASAR_HEWAN":
      await prisma.pasarHewan.update({ where: { id: entityId }, data: updateData });
      break;
    case "JAGAL":
      await prisma.jagal.update({ where: { id: entityId }, data: updateData });
      break;
  }
}

/**
 * Transfer full daging ownership (legacy behavior)
 * @param {Object} transaction - Transaction data
 * @returns {Promise<void>}
 */
async function transferFullDagingOwnership(transaction) {
  const { dagingId, pembeliType, pembeliId } = transaction;

  const dagingUpdateData = {
    distributorId: null,
    horekaId: null,
    endCustomerId: null,
    sudahDijual: true,
  };

  // Set new ownership based on buyer type
  if (pembeliType === "DISTRIBUTOR") {
    dagingUpdateData.distributorId = pembeliId;
  } else if (pembeliType === "HOREKA") {
    dagingUpdateData.horekaId = pembeliId;
  } else if (pembeliType === "END_CUSTOMER") {
    dagingUpdateData.endCustomerId = pembeliId;
  }

  await prisma.daging.update({
    where: { id: dagingId },
    data: dagingUpdateData,
  });

  console.log('✅ [DAGING TRANSFER] Full daging ownership transferred successfully');
}

/**
 * Record partial daging sale in RiwayatKepemilikanDaging
 * @param {Object} transaction - Transaction data with weight details
 * @returns {Promise<Object>} Created riwayat record
 */
async function recordPartialDagingSale(transaction) {
  const { dagingId, pembeliId, pembeliType, beratDaging, beratJeroan, beratTulang, totalBerat, id } = transaction;

  // Currently only support partial sales to DISTRIBUTOR
  // Can be extended for HOREKA and END_CUSTOMER later
  if (pembeliType !== "DISTRIBUTOR") {
    console.warn(`⚠️ Partial sales to ${pembeliType} not yet implemented in riwayat tracking`);
    return null;
  }

  const riwayat = await prisma.riwayatKepemilikanDaging.create({
    data: {
      dagingId: dagingId,
      distributorId: pembeliId,
      beratDaging: beratDaging || 0,
      beratJeroan: beratJeroan || 0,
      beratTulang: beratTulang || 0,
      totalBerat: totalBerat,
      transaksiPenjualanId: id,
    },
  });

  console.log('✅ [DAGING TRANSFER] Partial sale recorded in RiwayatKepemilikanDaging:', {
    dagingId,
    distributorId: pembeliId,
    totalBerat,
  });

  return riwayat;
}

/**
 * Transfer daging ownership based on transaction type (full or partial)
 * @param {Object} transaction - Transaction data
 * @returns {Promise<void>}
 */
async function transferDagingOwnership(transaction) {
  const { dagingId, pembeliType, totalBerat } = transaction;

  console.log('📦 [DAGING TRANSFER] Transferring daging ownership:', {
    dagingId,
    pembeliType,
    totalBerat,
    isPartialSale: !!totalBerat,
  });

  // For partial sale to distributor, create riwayat kepemilikan record
  if (pembeliType === "DISTRIBUTOR" && totalBerat) {
    await recordPartialDagingSale(transaction);
  } else {
    // Full ownership transfer (legacy behavior for non-partial sales)
    await transferFullDagingOwnership(transaction);
  }
}

module.exports = {
  transferSapiOwnership,
  transferDagingOwnership,
  transferFullDagingOwnership,
  recordPartialDagingSale,
  updateEntitySapiCount,
};
