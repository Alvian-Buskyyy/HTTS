const transaksiPenjualanService = require("../services/transaksiPenjualan");
const enrichTransaksiWithEntityInfo = require("../service/transaksiPenjualan/enrichTransaksiWithEntityInfo");
const { sendTransactionCancelEmail } = require("../utils/emailService");

/**
 * Create new transaction penjualan
 */
exports.createTransaksiPenjualan = async (req, res) => {
  const { penjualType, pembeliType, penjualId, pembeliId, sapiId, dagingId, jumlahQty, type, beratDaging, beratJeroan, beratTulang } = req.body;

  try {
    // Validate penjual exists
    await transaksiPenjualanService.validateEntity(penjualType, penjualId, "penjual");

    // Validate pembeli exists
    await transaksiPenjualanService.validateEntity(pembeliType, pembeliId, "pembeli");

    // Validate item being sold and ownership
    let itemType = "";
    let totalBerat = null;

    if (sapiId) {
      await transaksiPenjualanService.validateSapiOwnership(sapiId, penjualType, penjualId);
      itemType = "sapi";
    }

    if (dagingId) {
      // Check if this is a partial sale (has weight details)
      if (beratDaging !== undefined && beratJeroan !== undefined && beratTulang !== undefined) {
        const validation = await transaksiPenjualanService.validatePartialDagingSale(
          dagingId,
          penjualType,
          penjualId,
          parseFloat(beratDaging),
          parseFloat(beratJeroan),
          parseFloat(beratTulang)
        );
        totalBerat = validation.totalBerat;
        itemType = "daging";
      } else {
        // Full ownership transfer (legacy)
        await transaksiPenjualanService.validateDagingFullOwnership(dagingId, penjualType, penjualId);
        itemType = "daging";
      }
    }

    if (!sapiId && !dagingId) {
      return res.status(400).json({ error: "Harus ada sapiId atau dagingId" });
    }

    // Validate transaction flow
    transaksiPenjualanService.validateTransactionFlow(penjualType, pembeliType, itemType);

    // Create transaction
    const result = await transaksiPenjualanService.createTransaction({
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
    });

    res.status(201).json({
      message: "Transaksi penjualan dibuat. OTP telah dikirim ke email untuk verifikasi.",
      data: result.transaction,
      emailSent: result.emailSent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Buyer confirms verification code
 */
exports.confirmBuyer = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;

  try {
    const result = await transaksiPenjualanService.verifyAndTransferOwnership(id, code);

    res.status(200).json({
      message: "Verifikasi pembeli berhasil. CID dibuat dan kepemilikan ditransfer.",
      data: result.transaction,
      ipfsCid: result.cid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject verification
 */
exports.rejectVerification = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await transaksiPenjualanService.rejectVerification(id);
    res.status(200).json({ message: "Verifikasi ditolak", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel transaction
 */
exports.cancelTransaksi = async (req, res) => {
  const { id } = req.params;
  const { reason = "Dibatalkan oleh pengguna" } = req.body;

  try {
    const cancelled = await transaksiPenjualanService.cancelTransaction(id, reason);

    // Send cancellation notification email
    try {
      const recipientEmail = "taktujik@gmail.com";
      await sendTransactionCancelEmail(recipientEmail, id, {
        reason,
        penjualType: cancelled.penjualType,
        pembeliType: cancelled.pembeliType,
      });
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
    }

    res.status(200).json({
      message: "Transaksi berhasil dibatalkan",
      data: cancelled,
    });
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get transaction by ID
 */
exports.getTransaksiPenjualanById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaksi = await transaksiPenjualanService.getTransactionById(id);

    if (transaksi) {
      res.status(200).json(transaksi);
    } else {
      res.status(404).json({ error: `Transaksi Penjualan with ID ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get incoming transactions for entity
 */
exports.getIncomingTransaksi = async (req, res) => {
  const { entityType, entityId } = req.params;

  try {
    // Validate entity exists
    await transaksiPenjualanService.validateEntity(entityType, entityId, "entity");

    const transactions = await transaksiPenjualanService.getIncomingTransactions(entityType, entityId);
    const enrichedTransaksi = await enrichTransaksiWithEntityInfo(transactions);

    res.status(200).json({
      message: `Incoming transactions for ${entityType} ${entityId} retrieved successfully`,
      count: enrichedTransaksi.length,
      data: enrichedTransaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get outgoing transactions for entity
 */
exports.getOutgoingTransaksi = async (req, res) => {
  const { entityType, entityId } = req.params;

  try {
    // Validate entity exists
    await transaksiPenjualanService.validateEntity(entityType, entityId, "entity");

    const transactions = await transaksiPenjualanService.getOutgoingTransactions(entityType, entityId);
    const enrichedTransaksi = await enrichTransaksiWithEntityInfo(transactions);

    res.status(200).json({
      message: `Outgoing transactions for ${entityType} ${entityId} retrieved successfully`,
      count: enrichedTransaksi.length,
      data: enrichedTransaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all transactions for Jagal
 */
exports.getJagalTransactions = async (req, res) => {
  const { jagalId } = req.params;

  try {
    const result = await transaksiPenjualanService.getAllEntityTransactions("JAGAL", jagalId);
    const enrichedIncoming = await enrichTransaksiWithEntityInfo(result.incoming);
    const enrichedOutgoing = await enrichTransaksiWithEntityInfo(result.outgoing);

    res.status(200).json({
      message: `All transactions for Jagal ${jagalId} retrieved successfully`,
      jagalId,
      totalTransactions: result.total,
      incoming: {
        count: enrichedIncoming.length,
        data: enrichedIncoming,
      },
      outgoing: {
        count: enrichedOutgoing.length,
        data: enrichedOutgoing,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all transactions for Distributor
 */
exports.getDistributorTransactions = async (req, res) => {
  const { distributorId } = req.params;

  try {
    const result = await transaksiPenjualanService.getAllEntityTransactions("DISTRIBUTOR", distributorId);
    const enrichedIncoming = await enrichTransaksiWithEntityInfo(result.incoming);
    const enrichedOutgoing = await enrichTransaksiWithEntityInfo(result.outgoing);

    res.status(200).json({
      message: `All transactions for Distributor ${distributorId} retrieved successfully`,
      distributorId,
      totalTransactions: result.total,
      incoming: {
        count: enrichedIncoming.length,
        data: enrichedIncoming,
      },
      outgoing: {
        count: enrichedOutgoing.length,
        data: enrichedOutgoing,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all transactions for Horeka
 */
exports.getHorekaTransactions = async (req, res) => {
  const { horekaId } = req.params;

  try {
    const result = await transaksiPenjualanService.getAllEntityTransactions("HOREKA", horekaId);
    const enrichedIncoming = await enrichTransaksiWithEntityInfo(result.incoming);
    const enrichedOutgoing = await enrichTransaksiWithEntityInfo(result.outgoing);

    res.status(200).json({
      message: `All transactions for Horeka ${horekaId} retrieved successfully`,
      horekaId,
      totalTransactions: result.total,
      incoming: {
        count: enrichedIncoming.length,
        data: enrichedIncoming,
      },
      outgoing: {
        count: enrichedOutgoing.length,
        data: enrichedOutgoing,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete transaction - admin only
 */
exports.deleteTransaksiPenjualan = async (req, res) => {
  const { id } = req.params;

  try {
    const existingTransaksi = await transaksiPenjualanService.getTransactionById(id);

    if (!existingTransaksi) {
      return res.status(404).json({ error: `Transaksi Penjualan with ID ${id} not found` });
    }

    await prisma.transaksiPenjualan.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
