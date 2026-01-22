const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadToIPFS } = require("../../config/ipfs");
const { transferSapiOwnership, transferDagingOwnership } = require("./ownershipTransfer.service");

/**
 * Verify transaction with code and transfer ownership
 * @param {string} transactionId - Transaction ID
 * @param {string} code - Verification code
 * @returns {Promise<Object>} Verified transaction with CID
 */
async function verifyAndTransferOwnership(transactionId, code) {
  const existing = await prisma.transaksiPenjualan.findUnique({ where: { id: transactionId } });

  if (!existing) {
    throw new Error("Transaksi tidak ditemukan");
  }

  console.log('🔍 [BACKEND VERIFY] Received confirmation request:', {
    transactionId,
    receivedCode: code,
    storedCode: existing.verificationCode,
    status: existing.verificationStatus,
  });

  if (existing.verificationStatus === "REJECTED") {
    throw new Error("Transaksi sudah ditolak");
  }

  const expected = existing.verificationCode || "";
  const receivedCode = (code || "").trim();

  if (!receivedCode || receivedCode !== expected) {
    throw new Error("Kode verifikasi tidak cocok");
  }

  console.log('✅ [BACKEND VERIFY] Code matched! Proceeding with verification...');

  // Prepare transaction data for IPFS
  const timestamp = new Date();
  const transaksiData = {
    penjualType: existing.penjualType,
    penjualId: existing.penjualId,
    pembeliType: existing.pembeliType,
    pembeliId: existing.pembeliId,
    sapiId: existing.sapiId,
    dagingId: existing.dagingId,
    jumlahQty: existing.jumlahQty,
    type: existing.type,
    beratDaging: existing.beratDaging,
    beratJeroan: existing.beratJeroan,
    beratTulang: existing.beratTulang,
    totalBerat: existing.totalBerat,
    timestamp: timestamp.toISOString(),
  };

  // Upload to IPFS and get CID
  const transaksiDataString = JSON.stringify(transaksiData);
  const cid = await uploadToIPFS(transaksiDataString);

  // Update transaction: mark verified, set CID
  const updatedTransaksi = await prisma.transaksiPenjualan.update({
    where: { id: transactionId },
    data: {
      verifikasiPembeli: true,
      verificationStatus: "VERIFIED",
      cid,
      timestamp,
    },
  });

  // Transfer ownership after verification
  if (existing.sapiId) {
    await transferSapiOwnership(existing);
  }

  if (existing.dagingId) {
    await transferDagingOwnership(existing);
  }

  return {
    transaction: updatedTransaksi,
    cid,
  };
}

/**
 * Reject transaction verification
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Rejected transaction
 */
async function rejectVerification(transactionId) {
  const existing = await prisma.transaksiPenjualan.findUnique({ where: { id: transactionId } });

  if (!existing) {
    throw new Error(`Transaksi Penjualan dengan ID ${transactionId} tidak ditemukan`);
  }

  return prisma.transaksiPenjualan.update({
    where: { id: transactionId },
    data: {
      verificationStatus: "REJECTED",
      verifikasiPembeli: false,
    },
  });
}

module.exports = {
  verifyAndTransferOwnership,
  rejectVerification,
};
