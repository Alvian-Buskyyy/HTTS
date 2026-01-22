const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateOTP, sendOTPEmail } = require("../../utils/emailService");

/**
 * Create new transaction with OTP verification
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction with email status
 */
async function createTransaction(transactionData) {
  const {
    penjualType,
    penjualId,
    pembeliType,
    pembeliId,
    sapiId,
    dagingId,
    jumlahQty,
    type,
    beratDaging,
    beratJeroan,
    beratTulang,
    totalBerat,
  } = transactionData;

  // Generate verification code
  const verificationCode = generateOTP();

  // Create transaction record
  const newTransaksi = await prisma.transaksiPenjualan.create({
    data: {
      penjualType,
      penjualId,
      pembeliType,
      pembeliId,
      sapiId,
      dagingId,
      jumlahQty,
      type,
      beratDaging: beratDaging ? parseFloat(beratDaging) : null,
      beratJeroan: beratJeroan ? parseFloat(beratJeroan) : null,
      beratTulang: beratTulang ? parseFloat(beratTulang) : null,
      totalBerat,
      verifikasiPenjual: true,
      verifikasiPembeli: false,
      verificationStatus: "PENDING",
      verificationCode,
    },
  });

  // Send OTP email
  const recipientEmail = "taktujik@gmail.com"; // TODO: Get from user data
  const emailResult = await sendOTPEmail(
    recipientEmail,
    verificationCode,
    newTransaksi.id,
    "Transaksi Penjualan"
  );

  return {
    transaction: newTransaksi,
    emailSent: emailResult.success,
  };
}

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>} Transaction data
 */
async function getTransactionById(id) {
  return prisma.transaksiPenjualan.findUnique({
    where: { id },
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
  });
}

/**
 * Update transaction verification status
 * @param {string} id - Transaction ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated transaction
 */
async function updateTransaction(id, updateData) {
  return prisma.transaksiPenjualan.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Cancel transaction
 * @param {string} id - Transaction ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancelled transaction
 */
async function cancelTransaction(id, reason) {
  const existing = await getTransactionById(id);

  if (!existing) {
    throw new Error(`Transaksi Penjualan dengan ID ${id} tidak ditemukan`);
  }

  if (existing.verificationStatus === "VERIFIED") {
    throw new Error("Transaksi yang sudah diverifikasi tidak dapat dibatalkan");
  }

  if (existing.verificationStatus === "REJECTED") {
    throw new Error("Transaksi sudah ditolak sebelumnya");
  }

  return prisma.transaksiPenjualan.update({
    where: { id },
    data: {
      verificationStatus: "CANCELLED",
      verifikasiPembeli: false,
      verifikasiPenjual: false,
      notes: existing.notes ? `${existing.notes} | DIBATALKAN: ${reason}` : `DIBATALKAN: ${reason}`,
    },
  });
}

module.exports = {
  createTransaction,
  getTransactionById,
  updateTransaction,
  cancelTransaction,
};
