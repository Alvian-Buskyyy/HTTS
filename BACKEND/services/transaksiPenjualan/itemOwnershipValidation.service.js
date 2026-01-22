const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Validate sapi ownership and availability
 * @param {string} sapiId - Sapi ID
 * @param {string} penjualType - Seller entity type
 * @param {string} penjualId - Seller entity ID
 * @returns {Promise<Object>} Sapi data if valid
 * @throws {Error} If validation fails
 */
async function validateSapiOwnership(sapiId, penjualType, penjualId) {
  const sapi = await prisma.sapi.findUnique({
    where: { id: sapiId },
    include: {
      peternak: true,
      pasarHewan: true,
      jagal: true,
    },
  });

  if (!sapi) {
    throw new Error(`Sapi dengan ID ${sapiId} tidak ditemukan`);
  }

  if (sapi.isProcessed) {
    throw new Error("Sapi sudah diproses menjadi daging, tidak bisa dijual lagi");
  }

  // Validate ownership
  let isOwner = false;
  switch (penjualType) {
    case "PETERNAK":
      isOwner = sapi.peternakId === penjualId;
      break;
    case "PASAR_HEWAN":
      isOwner = sapi.pasarHewanId === penjualId;
      break;
    case "JAGAL":
      isOwner = sapi.jagalId === penjualId;
      break;
  }

  if (!isOwner) {
    throw new Error(`Sapi tidak dimiliki oleh ${penjualType} dengan ID ${penjualId}`);
  }

  return sapi;
}

/**
 * Validate daging ownership for full sale
 * @param {string} dagingId - Daging ID
 * @param {string} penjualType - Seller entity type
 * @param {string} penjualId - Seller entity ID
 * @returns {Promise<Object>} Daging data if valid
 * @throws {Error} If validation fails
 */
async function validateDagingFullOwnership(dagingId, penjualType, penjualId) {
  const daging = await prisma.daging.findUnique({
    where: { id: dagingId },
    include: {
      sapi: true,
      jagal: true,
      distributor: true,
      horeka: true,
      endCustomer: true,
    },
  });

  if (!daging) {
    throw new Error(`Daging dengan ID ${dagingId} tidak ditemukan`);
  }

  // Check if already sold
  if (daging.sudahDijual && penjualType !== "DISTRIBUTOR" && penjualType !== "HOREKA") {
    throw new Error("Daging sudah dijual");
  }

  // Validate ownership
  let isOwner = false;
  switch (penjualType) {
    case "JAGAL":
      isOwner = daging.jagalId === penjualId && !daging.distributorId && !daging.horekaId && !daging.endCustomerId;
      break;
    case "DISTRIBUTOR":
      isOwner = daging.distributorId === penjualId;
      break;
    case "HOREKA":
      isOwner = daging.horekaId === penjualId;
      break;
    case "END_CUSTOMER":
      isOwner = daging.endCustomerId === penjualId;
      break;
  }

  if (!isOwner) {
    throw new Error(`Daging tidak dimiliki oleh ${penjualType} dengan ID ${penjualId}`);
  }

  return daging;
}

/**
 * Get total owned weight of daging for partial sales
 * @param {string} dagingId - Daging ID
 * @param {string} ownerType - Owner entity type (DISTRIBUTOR, HOREKA)
 * @param {string} ownerId - Owner entity ID
 * @returns {Promise<number>} Total owned weight in kg
 */
async function getTotalOwnedWeight(dagingId, ownerType, ownerId) {
  // Get all riwayat kepemilikan for this owner
  const riwayatList = await prisma.riwayatKepemilikanDaging.findMany({
    where: {
      dagingId: dagingId,
      distributorId: ownerId, // Currently only supports distributor
    },
  });

  // Sum up total owned weight
  const totalOwned = riwayatList.reduce((sum, riwayat) => sum + riwayat.totalBerat, 0);

  return totalOwned;
}

/**
 * Get total sold weight from this owner
 * @param {string} dagingId - Daging ID
 * @param {string} sellerId - Seller entity ID
 * @param {string} sellerType - Seller entity type
 * @returns {Promise<number>} Total sold weight in kg
 */
async function getTotalSoldWeight(dagingId, sellerId, sellerType) {
  const soldTransactions = await prisma.transaksiPenjualan.findMany({
    where: {
      dagingId: dagingId,
      penjualId: sellerId,
      penjualType: sellerType,
      verificationStatus: "VERIFIED",
      totalBerat: { not: null },
    },
  });

  const totalSold = soldTransactions.reduce((sum, tx) => sum + (tx.totalBerat || 0), 0);

  return totalSold;
}

/**
 * Validate partial daging sale
 * @param {string} dagingId - Daging ID
 * @param {string} penjualType - Seller entity type
 * @param {string} penjualId - Seller entity ID
 * @param {number} beratDaging - Weight of meat being sold
 * @param {number} beratJeroan - Weight of offal being sold
 * @param {number} beratTulang - Weight of bones being sold
 * @returns {Promise<Object>} Validation result with daging data
 * @throws {Error} If validation fails
 */
async function validatePartialDagingSale(dagingId, penjualType, penjualId, beratDaging, beratJeroan, beratTulang) {
  const daging = await prisma.daging.findUnique({
    where: { id: dagingId },
    include: {
      sapi: true,
      jagal: true,
      riwayatKepemilikanDaging: true,
    },
  });

  if (!daging) {
    throw new Error(`Daging dengan ID ${dagingId} tidak ditemukan`);
  }

  const totalBerat = beratDaging + beratJeroan + beratTulang;

  // For Jagal: validate against original daging total
  if (penjualType === "JAGAL") {
    if (daging.jagalId !== penjualId) {
      throw new Error(`Daging tidak dimiliki oleh Jagal dengan ID ${penjualId}`);
    }

    // Get total already sold by this jagal
    const totalSold = await getTotalSoldWeight(dagingId, penjualId, penjualType);
    const availableWeight = daging.totalBerat - totalSold;

    if (totalBerat > availableWeight) {
      throw new Error(
        `Total berat yang dijual (${totalBerat} kg) melebihi berat tersedia (${availableWeight} kg). Sudah terjual: ${totalSold} kg dari ${daging.totalBerat} kg`
      );
    }
  }
  
  // For Distributor/Horeka: validate against owned weight
  if (penjualType === "DISTRIBUTOR" || penjualType === "HOREKA") {
    const totalOwned = await getTotalOwnedWeight(dagingId, penjualType, penjualId);
    const totalSold = await getTotalSoldWeight(dagingId, penjualId, penjualType);
    const availableWeight = totalOwned - totalSold;

    if (totalBerat > availableWeight) {
      throw new Error(
        `Total berat yang dijual (${totalBerat} kg) melebihi berat yang dimiliki (${availableWeight} kg). Dimiliki: ${totalOwned} kg, Sudah terjual: ${totalSold} kg`
      );
    }
  }

  return {
    daging,
    totalBerat,
    isValid: true,
  };
}

module.exports = {
  validateSapiOwnership,
  validateDagingFullOwnership,
  validatePartialDagingSale,
  getTotalOwnedWeight,
  getTotalSoldWeight,
};
