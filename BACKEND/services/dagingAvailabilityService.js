const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Menghitung sisa berat daging yang tersedia untuk dijual oleh penjual tertentu
 * @param {string} dagingId - ID daging
 * @param {string} penjualType - Tipe penjual (JAGAL, DISTRIBUTOR, HOREKA)
 * @param {string} penjualId - ID penjual
 * @returns {Promise<{sisaDaging: number, totalAwal: number, totalTerjual: number, breakdown: object}>}
 */
async function getAvailableDagingWeight(dagingId, penjualType, penjualId) {
  // Get data daging
  const daging = await prisma.daging.findUnique({
    where: { id: dagingId },
    include: {
      riwayatKepemilikanDaging: true
    }
  });

  if (!daging) {
    throw new Error(`Daging dengan ID ${dagingId} tidak ditemukan`);
  }

  let sisaDaging = 0;
  let totalAwal = 0;
  let totalTerjual = 0;
  let breakdown = {
    beratDaging: 0,
    beratJeroan: 0,
    beratTulang: 0
  };

  // For Jagal (original owner)
  if (penjualType === "JAGAL") {
    totalAwal = daging.totalBerat;

    // Hitung total yang sudah terjual oleh Jagal
    const riwayatPenjualan = await prisma.transaksiPenjualan.findMany({
      where: {
        dagingId: dagingId,
        penjualType: "JAGAL",
        penjualId: penjualId,
        verificationStatus: "VERIFIED",
        totalBerat: { not: null }
      }
    });

    totalTerjual = riwayatPenjualan.reduce((sum, tx) => sum + (tx.totalBerat || 0), 0);
    sisaDaging = totalAwal - totalTerjual;

    // Calculate breakdown proportionally
    if (totalAwal > 0) {
      const ratio = sisaDaging / totalAwal;
      breakdown.beratDaging = daging.beratDaging * ratio;
      breakdown.beratJeroan = daging.beratJeroan * ratio;
      breakdown.beratTulang = daging.beratTulang * ratio;
    }
  }

  // For Distributor/Horeka (partial owner)
  if (penjualType === "DISTRIBUTOR" || penjualType === "HOREKA") {
    // Get total owned dari riwayat kepemilikan
    const riwayatKepemilikan = await prisma.riwayatKepemilikanDaging.findMany({
      where: {
        dagingId: dagingId,
        distributorId: penjualId
      }
    });

    totalAwal = riwayatKepemilikan.reduce((sum, r) => sum + r.totalBerat, 0);

    // Get total sold
    const riwayatPenjualan = await prisma.transaksiPenjualan.findMany({
      where: {
        dagingId: dagingId,
        penjualType: penjualType,
        penjualId: penjualId,
        verificationStatus: "VERIFIED",
        totalBerat: { not: null }
      }
    });

    totalTerjual = riwayatPenjualan.reduce((sum, tx) => sum + (tx.totalBerat || 0), 0);
    sisaDaging = totalAwal - totalTerjual;

    // Calculate breakdown from owned portions
    const totalBeratDaging = riwayatKepemilikan.reduce((sum, r) => sum + r.beratDaging, 0);
    const totalBeratJeroan = riwayatKepemilikan.reduce((sum, r) => sum + r.beratJeroan, 0);
    const totalBeratTulang = riwayatKepemilikan.reduce((sum, r) => sum + r.beratTulang, 0);

    // Calculate sold breakdown
    const soldBeratDaging = riwayatPenjualan.reduce((sum, tx) => sum + (tx.beratDaging || 0), 0);
    const soldBeratJeroan = riwayatPenjualan.reduce((sum, tx) => sum + (tx.beratJeroan || 0), 0);
    const soldBeratTulang = riwayatPenjualan.reduce((sum, tx) => sum + (tx.beratTulang || 0), 0);

    breakdown.beratDaging = totalBeratDaging - soldBeratDaging;
    breakdown.beratJeroan = totalBeratJeroan - soldBeratJeroan;
    breakdown.beratTulang = totalBeratTulang - soldBeratTulang;
  }

  return {
    sisaDaging: parseFloat(sisaDaging.toFixed(2)),
    totalAwal: parseFloat(totalAwal.toFixed(2)),
    totalTerjual: parseFloat(totalTerjual.toFixed(2)),
    breakdown: {
      beratDaging: parseFloat(breakdown.beratDaging.toFixed(2)),
      beratJeroan: parseFloat(breakdown.beratJeroan.toFixed(2)),
      beratTulang: parseFloat(breakdown.beratTulang.toFixed(2))
    }
  };
}

/**
 * Menghitung total berat daging yang dimiliki oleh semua distributor
 * @param {string} dagingId - ID daging
 * @returns {Promise<number>}
 */
async function getTotalDistributedWeight(dagingId) {
  const riwayatKepemilikan = await prisma.riwayatKepemilikanDaging.findMany({
    where: { dagingId }
  });

  return riwayatKepemilikan.reduce((sum, r) => sum + r.totalBerat, 0);
}

/**
 * Validasi apakah berat yang akan dijual tidak melebihi ketersediaan
 * @param {string} dagingId - ID daging
 * @param {string} penjualType - Tipe penjual
 * @param {string} penjualId - ID penjual
 * @param {number} beratDaging - Berat daging yang akan dijual
 * @param {number} beratJeroan - Berat jeroan yang akan dijual
 * @param {number} beratTulang - Berat tulang yang akan dijual
 * @returns {Promise<{valid: boolean, error?: string, available?: object}>}
 */
async function validateDagingAvailability(dagingId, penjualType, penjualId, beratDaging, beratJeroan, beratTulang) {
  const totalBeratInput = parseFloat(beratDaging) + parseFloat(beratJeroan) + parseFloat(beratTulang);
  
  const availability = await getAvailableDagingWeight(dagingId, penjualType, penjualId);

  if (totalBeratInput > availability.sisaDaging) {
    return {
      valid: false,
      error: `Total berat yang dijual (${totalBeratInput.toFixed(2)} kg) melebihi sisa ketersediaan (${availability.sisaDaging.toFixed(2)} kg)`,
      available: availability,
      details: {
        sisaDaging: availability.sisaDaging.toFixed(2),
        totalBeratInput: totalBeratInput.toFixed(2),
        beratDaging: parseFloat(beratDaging).toFixed(2),
        beratJeroan: parseFloat(beratJeroan).toFixed(2),
        beratTulang: parseFloat(beratTulang).toFixed(2),
      }
    };
  }

  return {
    valid: true,
    available: availability
  };
}

/**
 * Mencatat pengurangan berat daging setelah transaksi terverifikasi
 * Fungsi ini dipanggil setelah transaksi VERIFIED untuk tracking
 * @param {string} transaksiId - ID transaksi yang sudah verified
 * @returns {Promise<void>}
 */
async function recordDagingSaleReduction(transaksiId) {
  const transaksi = await prisma.transaksiPenjualan.findUnique({
    where: { id: transaksiId },
    include: { daging: true }
  });

  if (!transaksi || transaksi.verificationStatus !== 'VERIFIED') {
    throw new Error('Transaksi tidak ditemukan atau belum terverifikasi');
  }

  // Log the sale for tracking purposes
  console.log(`📉 [DAGING REDUCTION] Recorded sale reduction:`, {
    dagingId: transaksi.dagingId,
    seller: `${transaksi.penjualType} (${transaksi.penjualId})`,
    buyer: `${transaksi.pembeliType} (${transaksi.pembeliId})`,
    totalBerat: transaksi.totalBerat,
    breakdown: {
      beratDaging: transaksi.beratDaging,
      beratJeroan: transaksi.beratJeroan,
      beratTulang: transaksi.beratTulang
    }
  });

  // Return current availability after this sale
  return getAvailableDagingWeight(
    transaksi.dagingId,
    transaksi.penjualType,
    transaksi.penjualId
  );
}

module.exports = {
  getAvailableDagingWeight,
  getTotalDistributedWeight,
  validateDagingAvailability,
  recordDagingSaleReduction
};
