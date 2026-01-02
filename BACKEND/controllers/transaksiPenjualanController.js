const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadToIPFS } = require("../config/ipfs");
const { generateOTP, sendOTPEmail, sendTransactionSuccessEmail, sendTransactionCancelEmail } = require("../utils/emailService");

exports.getAllTransaksiPenjualan = async (req, res) => {
  try {
    const transaksiPenjualan = await prisma.transaksiPenjualan.findMany({
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
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });
    res.status(200).json({
      message: "All transactions retrieved successfully",
      count: transaksiPenjualan.length,
      data: transaksiPenjualan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Testing endpoint - Get transactions by seller type
exports.getTransaksiByPenjualType = async (req, res) => {
  const { penjualType } = req.params;

  try {
    const validSellerTypes = ["PETERNAK", "PASAR_HEWAN", "JAGAL", "RPH", "DISTRIBUTOR", "HOREKA"];
    
    if (!validSellerTypes.includes(penjualType)) {
      return res.status(400).json({ 
        error: `Invalid penjualType. Must be one of: ${validSellerTypes.join(', ')}` 
      });
    }

    const transaksiPenjualan = await prisma.transaksiPenjualan.findMany({
      where: {
        penjualType: penjualType
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
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Enrich data with seller and buyer information
    const enrichedTransaksi = await Promise.all(
      transaksiPenjualan.map(async (transaksi) => {
        let sellerInfo = null;
        let buyerInfo = null;

        // Get seller information
        switch (transaksi.penjualType) {
          case "PETERNAK":
            sellerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "PASAR_HEWAN":
            sellerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "JAGAL":
            sellerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "RPH":
            sellerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "DISTRIBUTOR":
            sellerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "HOREKA":
            sellerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
        }

        // Get buyer information
        switch (transaksi.pembeliType) {
          case "PETERNAK":
            buyerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "PASAR_HEWAN":
            buyerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "JAGAL":
            buyerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "RPH":
            buyerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "DISTRIBUTOR":
            buyerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "HOREKA":
            buyerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
        }

        return {
          ...transaksi,
          sellerInfo,
          buyerInfo,
        };
      })
    );

    res.status(200).json({
      message: `Transactions for seller type ${penjualType} retrieved successfully`,
      penjualType,
      count: enrichedTransaksi.length,
      data: enrichedTransaksi
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Testing endpoint - Get transactions by buyer type  
exports.getTransaksiByPembeliType = async (req, res) => {
  const { pembeliType } = req.params;

  try {
    const validBuyerTypes = ["PETERNAK", "PASAR_HEWAN", "JAGAL", "RPH", "DISTRIBUTOR", "HOREKA"];
    
    if (!validBuyerTypes.includes(pembeliType)) {
      return res.status(400).json({ 
        error: `Invalid pembeliType. Must be one of: ${validBuyerTypes.join(', ')}` 
      });
    }

    const transaksiPenjualan = await prisma.transaksiPenjualan.findMany({
      where: {
        pembeliType: pembeliType
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
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Enrich data with seller and buyer information
    const enrichedTransaksi = await Promise.all(
      transaksiPenjualan.map(async (transaksi) => {
        let sellerInfo = null;
        let buyerInfo = null;

        // Get seller information
        switch (transaksi.penjualType) {
          case "PETERNAK":
            sellerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "PASAR_HEWAN":
            sellerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "JAGAL":
            sellerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "RPH":
            sellerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "DISTRIBUTOR":
            sellerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "HOREKA":
            sellerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
        }

        // Get buyer information
        switch (transaksi.pembeliType) {
          case "PETERNAK":
            buyerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "PASAR_HEWAN":
            buyerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "JAGAL":
            buyerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "RPH":
            buyerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "DISTRIBUTOR":
            buyerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "HOREKA":
            buyerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
        }

        return {
          ...transaksi,
          sellerInfo,
          buyerInfo,
        };
      })
    );

    res.status(200).json({
      message: `Transactions for buyer type ${pembeliType} retrieved successfully`,
      pembeliType,
      count: enrichedTransaksi.length,
      data: enrichedTransaksi
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Testing endpoint - Get transaction statistics
exports.getTransaksiStats = async (req, res) => {
  try {
    // Get total counts by status
    const totalTransactions = await prisma.transaksiPenjualan.count();
    const pendingCount = await prisma.transaksiPenjualan.count({
      where: { verificationStatus: "PENDING" }
    });
    const verifiedCount = await prisma.transaksiPenjualan.count({
      where: { verificationStatus: "VERIFIED" }
    });
    const rejectedCount = await prisma.transaksiPenjualan.count({
      where: { verificationStatus: "REJECTED" }
    });
    const cancelledCount = await prisma.transaksiPenjualan.count({
      where: { verificationStatus: "CANCELLED" }
    });

    // Get counts by seller type
    const sellerTypeStats = await prisma.transaksiPenjualan.groupBy({
      by: ['penjualType'],
      _count: {
        penjualType: true
      }
    });

    // Get counts by buyer type
    const buyerTypeStats = await prisma.transaksiPenjualan.groupBy({
      by: ['pembeliType'],
      _count: {
        pembeliType: true
      }
    });

    // Get counts by item type
    const itemTypeStats = await prisma.transaksiPenjualan.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    res.status(200).json({
      message: "Transaction statistics retrieved successfully",
      data: {
        totals: {
          total: totalTransactions,
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
          cancelled: cancelledCount
        },
        bySellerType: sellerTypeStats.reduce((acc, item) => {
          acc[item.penjualType] = item._count.penjualType;
          return acc;
        }, {}),
        byBuyerType: buyerTypeStats.reduce((acc, item) => {
          acc[item.pembeliType] = item._count.pembeliType;
          return acc;
        }, {}),
        byItemType: itemTypeStats.reduce((acc, item) => {
          acc[item.type || 'unknown'] = item._count.type;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiPenjualanById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaksiPenjualan = await prisma.transaksiPenjualan.findUnique({
      where: { id },
    });
    if (transaksiPenjualan) {
      res.status(200).json(transaksiPenjualan);
    } else {
      res.status(404).json({ error: "Transaksi Penjualan not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaksiPenjualan = async (req, res) => {
  const { penjualType, pembeliType, penjualId, pembeliId, sapiId, dagingId, jumlahQty, type } = req.body;

  try {
    // Helper function untuk validasi entitas
    const validateEntity = async (entityType, entityId, role) => {
      let entity = null;
      const errorPrefix = role === "penjual" ? "Penjual" : "Pembeli";

      switch (entityType) {
        case "PETERNAK":
          entity = await prisma.peternak.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Peternak dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case "PASAR_HEWAN":
          entity = await prisma.pasarHewan.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Pasar Hewan dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case "JAGAL":
          entity = await prisma.jagal.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Jagal dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case "RPH":
          entity = await prisma.rPH.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} RPH dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case "DISTRIBUTOR":
          entity = await prisma.distributor.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Distributor dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        case "HOREKA":
          entity = await prisma.horeka.findUnique({ where: { id: entityId } });
          if (!entity) throw new Error(`${errorPrefix} Horeka dengan ID ${entityId} tidak ditemukan dalam sistem`);
          break;
        default:
          throw new Error(`Tipe entitas ${entityType} tidak valid`);
      }

      return entity;
    };

    // Validate transaction flow according to business rules
    const validateTransactionFlow = (penjualType, pembeliType, itemType) => {
      const allowedFlows = {
        // Sapi transactions
        PETERNAK_PASAR_HEWAN: penjualType === "PETERNAK" && pembeliType === "PASAR_HEWAN" && itemType === "sapi",
        PASAR_HEWAN_JAGAL: penjualType === "PASAR_HEWAN" && pembeliType === "JAGAL" && itemType === "sapi",
        JAGAL_RPH: penjualType === "JAGAL" && pembeliType === "RPH" && itemType === "sapi",

        // Daging transactions
        JAGAL_DISTRIBUTOR: penjualType === "JAGAL" && pembeliType === "DISTRIBUTOR" && itemType === "daging",
        RPH_DISTRIBUTOR: penjualType === "RPH" && pembeliType === "DISTRIBUTOR" && itemType === "daging",
        DISTRIBUTOR_HOREKA: penjualType === "DISTRIBUTOR" && pembeliType === "HOREKA" && itemType === "daging",
        DISTRIBUTOR_END_CUSTOMER: penjualType === "DISTRIBUTOR" && pembeliType === "END_CUSTOMER" && itemType === "daging",
      };

      const isValidFlow = Object.values(allowedFlows).some((condition) => condition);

      if (!isValidFlow) {
        throw new Error(`Transaksi dari ${penjualType} ke ${pembeliType} untuk ${itemType} tidak diizinkan dalam alur bisnis`);
      }
    };

    // Validate penjual exists in system
    await validateEntity(penjualType, penjualId, "penjual");

    // Validate pembeli exists in system
    await validateEntity(pembeliType, pembeliId, "pembeli");

    // Validate item being sold and ownership
    let itemType = "";
    if (sapiId) {
      const sapi = await prisma.sapi.findUnique({
        where: { id: sapiId },
        include: {
          peternak: true,
          pasarHewan: true,
          jagal: true,
          pengecekanSehat: true,
        },
      });
      if (!sapi) {
        return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan` });
      }

      // Validate ownership of sapi
      let isOwner = false;
      if (penjualType === "PETERNAK" && sapi.peternakId === penjualId) {
        isOwner = true;
      } else if (penjualType === "PASAR_HEWAN" && sapi.pasarHewanId === penjualId) {
        isOwner = true;
      } else if (penjualType === "JAGAL" && sapi.jagalId === penjualId) {
        isOwner = true;
      }

      if (!isOwner) {
        return res.status(400).json({ error: `Penjual tidak memiliki kepemilikan atas sapi dengan ID ${sapiId}` });
      }

      itemType = "sapi";
    }

    if (dagingId) {
      const daging = await prisma.daging.findUnique({
        where: { id: dagingId },
        include: {
          sapi: true,
          jagal: true,
          rph: true,
        },
      });
      if (!daging) {
        return res.status(404).json({ error: `Daging dengan ID ${dagingId} tidak ditemukan` });
      }

      // Validate ownership of daging (only JAGAL and RPH can own daging)
      let isOwner = false;
      if (penjualType === "JAGAL" && daging.jagalId === penjualId) {
        isOwner = true;
      } else if (penjualType === "RPH") {
        // RPH can sell daging if they processed it
        const rphProcessed = await prisma.transaksiPenyembelihan.findFirst({
          where: {
            sapiId: daging.sapiId,
            penerimaType: "RPH",
            penerimaId: penjualId,
          },
        });
        if (rphProcessed) {
          isOwner = true;
        }
      } else if (penjualType === "DISTRIBUTOR") {
        // Check if distributor received this daging through previous transaction
        const distributorOwnership = await prisma.transaksiPenjualan.findFirst({
          where: {
            dagingId: dagingId,
            pembeliType: "DISTRIBUTOR",
            pembeliId: penjualId,
            verificationStatus: "VERIFIED",
          },
        });
        if (distributorOwnership) {
          isOwner = true;
        }
      }

      if (!isOwner) {
        return res.status(400).json({ error: `Penjual tidak memiliki kepemilikan atas daging dengan ID ${dagingId}` });
      }

      itemType = "daging";
    }

    if (!sapiId && !dagingId) {
      return res.status(400).json({ error: "sapiId atau dagingId harus diisi" });
    }

    // Validate transaction flow
    validateTransactionFlow(penjualType, pembeliType, itemType);

    // Generate verification code using email service
    const verificationCode = generateOTP();

    // Create transaction record (without CID and without ownership transfer yet)
    const newTransaksiPenjualan = await prisma.transaksiPenjualan.create({
      data: {
        penjualType,
        penjualId,
        pembeliType,
        pembeliId,
        sapiId,
        dagingId,
        jumlahQty,
        type,
        verifikasiPenjual: true,
        verifikasiPembeli: false,
        verificationStatus: "PENDING",
        verificationCode,
      },
    });

    // Send OTP email notification to taktujik@gmail.com (temporary email for testing)
    // TODO: In the future, this should be sent to both seller and buyer emails
    const recipientEmail = "taktujik@gmail.com";
    const emailResult = await sendOTPEmail(recipientEmail, verificationCode, newTransaksiPenjualan.id, "Transaksi Penjualan");

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      // Still return success for transaction creation, but log the email error
    }

    res.status(201).json({
      message: "Transaksi penjualan dibuat. OTP telah dikirim ke email untuk verifikasi.",
      data: newTransaksiPenjualan,
      emailSent: emailResult.success,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regenerate/request verification code (only seller can initiate)
exports.requestVerification = async (req, res) => {
  const { id } = req.params;
  const { requesterId, requesterType } = req.body;

  try {
    const existing = await prisma.transaksiPenjualan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    }

    // Only seller can request/generate OTP
    if (requesterType !== existing.penjualType || requesterId !== existing.penjualId) {
      return res.status(403).json({
        error: "Hanya penjual yang dapat memulai proses verifikasi bersama",
      });
    }

    if (existing.verificationStatus === "VERIFIED") {
      return res.status(400).json({ error: "Transaksi sudah diverifikasi" });
    }

    if (existing.verificationStatus === "CANCELLED" || existing.verificationStatus === "REJECTED") {
      return res.status(400).json({ error: "Transaksi sudah dibatalkan atau ditolak" });
    }

    const verificationCode = generateOTP();
    const updated = await prisma.transaksiPenjualan.update({
      where: { id },
      data: {
        verificationCode,
        verificationStatus: "PENDING",
        verifikasiPenjual: false, // Reset verification status
        verifikasiPembeli: false,
      },
    });

    // Send OTP email to both parties (currently using test email)
    const recipientEmail = "taktujik@gmail.com";
    const emailResult = await sendOTPEmail(recipientEmail, verificationCode, id, "Verifikasi Bersama Transaksi");

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
    }

    res.status(200).json({
      message: "Kode verifikasi dibuat. OTP telah dikirim ke kedua pihak untuk verifikasi bersama.",
      data: updated,
      emailSent: emailResult.success,
      instruction: "Penjual harus verifikasi terlebih dahulu, kemudian pembeli.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buyer confirms verification code, then generate CID and transfer ownership
exports.confirmBuyer = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  
  console.log('🔍 [BACKEND VERIFY] Received confirmation request:', {
    transactionId: id,
    receivedCode: code,
    codeType: typeof code,
    codeLength: code ? code.length : 0
  });
  
  try {
    const existing = await prisma.transaksiPenjualan.findUnique({ where: { id } });
    
    if (!existing) {
      console.error('❌ [BACKEND VERIFY] Transaction not found:', id);
      return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    }
    
    console.log('📋 [BACKEND VERIFY] Transaction found:', {
      id: existing.id,
      verificationCode: existing.verificationCode,
      codeType: typeof existing.verificationCode,
      codeLength: existing.verificationCode ? existing.verificationCode.length : 0,
      verificationStatus: existing.verificationStatus,
      type: existing.type
    });
    
    if (existing.verificationStatus === "REJECTED") {
      console.error('❌ [BACKEND VERIFY] Transaction already rejected');
      return res.status(400).json({ error: "Transaksi telah ditolak" });
    }
    
    const expected = existing.verificationCode || "";
    const receivedCode = (code || "").trim();
    
    console.log('🔐 [BACKEND VERIFY] Code comparison:', {
      received: receivedCode,
      expected: expected,
      match: receivedCode === expected,
      receivedLength: receivedCode.length,
      expectedLength: expected.length
    });
    
    if (!receivedCode || receivedCode !== expected) {
      console.error('❌ [BACKEND VERIFY] Code mismatch!');
      return res.status(400).json({ error: "Kode verifikasi tidak cocok" });
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
      timestamp: timestamp.toISOString(),
    };

    // Upload to IPFS and get CID
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    // Update transaction: mark verified, set CID
    const updatedTransaksi = await prisma.transaksiPenjualan.update({
      where: { id },
      data: {
        verifikasiPembeli: true,
        verificationStatus: "VERIFIED",
        cid,
        timestamp,
      },
    });

    // Transfer ownership after verification
    if (existing.sapiId) {
      const updateData = {
        peternakId: null,
        pasarHewanId: null,
        jagalId: null,
      };

      // Update ownership based on buyer type
      if (existing.pembeliType === "PETERNAK") {
        updateData.peternakId = existing.pembeliId;
      } else if (existing.pembeliType === "PASAR_HEWAN") {
        updateData.pasarHewanId = existing.pembeliId;
      } else if (existing.pembeliType === "JAGAL") {
        updateData.jagalId = existing.pembeliId;
      } else if (existing.pembeliType === "RPH") {
        // For RPH, we don't transfer ownership to RPH entity
        // Sapi will be converted to daging through transaksiPenyembelihan
        // So we keep ownership null for now
        updateData.peternakId = null;
        updateData.pasarHewanId = null;
        updateData.jagalId = null;
      } else {
        return res.status(400).json({
          error: `Transfer kepemilikan sapi ke ${existing.pembeliType} tidak diizinkan`,
        });
      }

      await prisma.sapi.update({
        where: { id: existing.sapiId },
        data: updateData,
      });

      // Update jumlah sapi for both entities
      if (existing.penjualType === "PETERNAK") {
        await prisma.peternak.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      } else if (existing.penjualType === "PASAR_HEWAN") {
        await prisma.pasarHewan.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      } else if (existing.penjualType === "JAGAL") {
        await prisma.jagal.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      }

      if (existing.pembeliType === "PETERNAK") {
        await prisma.peternak.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      } else if (existing.pembeliType === "PASAR_HEWAN") {
        await prisma.pasarHewan.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      } else if (existing.pembeliType === "JAGAL") {
        await prisma.jagal.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      }
    }

    // Transfer ownership for daging transactions
    if (existing.dagingId) {
      console.log('📦 [DAGING TRANSFER] Transferring daging ownership:', {
        dagingId: existing.dagingId,
        fromType: existing.penjualType,
        fromId: existing.penjualId,
        toType: existing.pembeliType,
        toId: existing.pembeliId
      });

      const dagingUpdateData = {
        // Clear previous ownership
        distributorId: null,
        horekaId: null,
        endCustomerId: null,
        sudahDijual: true
      };

      // Set new ownership based on buyer type
      if (existing.pembeliType === "DISTRIBUTOR") {
        dagingUpdateData.distributorId = existing.pembeliId;
      } else if (existing.pembeliType === "HOREKA") {
        dagingUpdateData.horekaId = existing.pembeliId;
      } else if (existing.pembeliType === "END_CUSTOMER") {
        dagingUpdateData.endCustomerId = existing.pembeliId;
      } else {
        console.warn('⚠️ [DAGING TRANSFER] Unsupported buyer type for daging:', existing.pembeliType);
      }

      await prisma.daging.update({
        where: { id: existing.dagingId },
        data: dagingUpdateData,
      });

      console.log('✅ [DAGING TRANSFER] Daging ownership transferred successfully');
    }

    res.status(200).json({ message: "Verifikasi pembeli berhasil. CID dibuat dan kepemilikan ditransfer.", data: updatedTransaksi, ipfsCid: cid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectVerification = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.transaksiPenjualan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    const updated = await prisma.transaksiPenjualan.update({
      where: { id },
      data: {
        verificationStatus: "REJECTED",
        verifikasiPembeli: false,
      },
    });
    res.status(200).json({ message: "Verifikasi ditolak", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel/Delete transaction - only allowed for pending transactions
exports.cancelTransaksi = async (req, res) => {
  const { id } = req.params;
  const { reason = "Dibatalkan oleh pengguna" } = req.body;

  try {
    // Check if the transaction exists
    const existing = await prisma.transaksiPenjualan.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    }

    // Only allow cancellation for pending transactions
    if (existing.verificationStatus === "VERIFIED") {
      return res.status(400).json({
        error: "Transaksi yang sudah diverifikasi tidak dapat dibatalkan",
      });
    }

    if (existing.verificationStatus === "REJECTED") {
      return res.status(400).json({
        error: "Transaksi sudah ditolak sebelumnya",
      });
    }

    // Update transaction status to CANCELLED instead of deleting
    const cancelled = await prisma.transaksiPenjualan.update({
      where: { id },
      data: {
        verificationStatus: "CANCELLED",
        verifikasiPembeli: false,
        verifikasiPenjual: false,
        notes: existing.notes ? `${existing.notes} | DIBATALKAN: ${reason}` : `DIBATALKAN: ${reason}`,
      },
    });

    // Send cancellation notification email
    try {
      const recipientEmail = "taktujik@gmail.com"; // TODO: get from user data
      const emailResult = await sendTransactionCancelEmail(recipientEmail, id, { reason, penjualType: existing.penjualType, pembeliType: existing.pembeliType });

      if (!emailResult.success) {
        console.error("Failed to send cancellation email:", emailResult.error);
      }
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

// Delete transaction - admin only
exports.deleteTransaksiPenjualan = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the transaction exists
    const existingTransaksi = await prisma.transaksiPenjualan.findUnique({
      where: { id },
    });

    if (!existingTransaksi) {
      return res.status(404).json({ error: `Transaksi Penjualan with ID ${id} not found` });
    }

    // Delete the transaction
    await prisma.transaksiPenjualan.delete({
      where: { id },
    });

    res.status(204).send(); // No content response for successful deletion
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions where user is the buyer/receiver
exports.getIncomingTransaksi = async (req, res) => {
  const { entityType, entityId } = req.params;

  try {
    // Validate entity exists
    const validateEntity = async (type, id) => {
      let entity = null;
      switch (type) {
        case "PETERNAK":
          entity = await prisma.peternak.findUnique({ where: { id } });
          break;
        case "PASAR_HEWAN":
          entity = await prisma.pasarHewan.findUnique({ where: { id } });
          break;
        case "JAGAL":
          entity = await prisma.jagal.findUnique({ where: { id } });
          break;
        case "RPH":
          entity = await prisma.rPH.findUnique({ where: { id } });
          break;
        case "DISTRIBUTOR":
          entity = await prisma.distributor.findUnique({ where: { id } });
          break;
        case "HOREKA":
          entity = await prisma.horeka.findUnique({ where: { id } });
          break;
        default:
          throw new Error(`Tipe entitas ${type} tidak valid`);
      }

      if (!entity) {
        throw new Error(`${type} dengan ID ${id} tidak ditemukan`);
      }
      return entity;
    };

    await validateEntity(entityType, entityId);

    // Get transactions where this entity is the buyer
    const incomingTransaksi = await prisma.transaksiPenjualan.findMany({
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
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Enrich data with seller information
    const enrichedTransaksi = await Promise.all(
      incomingTransaksi.map(async (transaksi) => {
        let sellerInfo = null;

        // Get seller information based on seller type
        switch (transaksi.penjualType) {
          case "PETERNAK":
            sellerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "PASAR_HEWAN":
            sellerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "JAGAL":
            sellerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "RPH":
            sellerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "DISTRIBUTOR":
            sellerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
          case "HOREKA":
            sellerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.penjualId },
            });
            break;
        }

        return {
          ...transaksi,
          sellerInfo,
        };
      })
    );

    res.status(200).json({
      message: "Transaksi incoming berhasil diambil",
      data: enrichedTransaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions where user is the seller
exports.getOutgoingTransaksi = async (req, res) => {
  const { entityType, entityId } = req.params;

  try {
    // Validate entity exists (same validation as incoming)
    const validateEntity = async (type, id) => {
      let entity = null;
      switch (type) {
        case "PETERNAK":
          entity = await prisma.peternak.findUnique({ where: { id } });
          break;
        case "PASAR_HEWAN":
          entity = await prisma.pasarHewan.findUnique({ where: { id } });
          break;
        case "JAGAL":
          entity = await prisma.jagal.findUnique({ where: { id } });
          break;
        case "RPH":
          entity = await prisma.rPH.findUnique({ where: { id } });
          break;
        case "DISTRIBUTOR":
          entity = await prisma.distributor.findUnique({ where: { id } });
          break;
        case "HOREKA":
          entity = await prisma.horeka.findUnique({ where: { id } });
          break;
        default:
          throw new Error(`Tipe entitas ${type} tidak valid`);
      }

      if (!entity) {
        throw new Error(`${type} dengan ID ${id} tidak ditemukan`);
      }
      return entity;
    };

    await validateEntity(entityType, entityId);

    // Get transactions where this entity is the seller
    const outgoingTransaksi = await prisma.transaksiPenjualan.findMany({
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
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Enrich data with buyer information
    const enrichedTransaksi = await Promise.all(
      outgoingTransaksi.map(async (transaksi) => {
        let buyerInfo = null;

        // Get buyer information based on buyer type
        switch (transaksi.pembeliType) {
          case "PETERNAK":
            buyerInfo = await prisma.peternak.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "PASAR_HEWAN":
            buyerInfo = await prisma.pasarHewan.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "JAGAL":
            buyerInfo = await prisma.jagal.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "RPH":
            buyerInfo = await prisma.rPH.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "DISTRIBUTOR":
            buyerInfo = await prisma.distributor.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
          case "HOREKA":
            buyerInfo = await prisma.horeka.findUnique({
              where: { id: transaksi.pembeliId },
            });
            break;
        }

        return {
          ...transaksi,
          buyerInfo,
        };
      })
    );

    res.status(200).json({
      message: "Transaksi outgoing berhasil diambil",
      data: enrichedTransaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New verification endpoint with role-based verification
exports.verifyTransaction = async (req, res) => {
  const { id } = req.params;
  const { verificationCode, verifierRole } = req.body; // verifierRole: 'seller' or 'buyer'

  try {
    const existing = await prisma.transaksiPenjualan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    }

    if (existing.verificationStatus === "REJECTED") {
      return res.status(400).json({ error: "Transaksi telah ditolak" });
    }

    if (existing.verificationStatus === "VERIFIED") {
      return res.status(400).json({ error: "Transaksi sudah diverifikasi" });
    }

    // Validate verification code
    const expected = existing.verificationCode || "";
    if (!verificationCode || verificationCode !== expected) {
      return res.status(400).json({ error: "Kode verifikasi tidak cocok" });
    }

    // Update verification based on role
    let updateData = {};
    let isCompleted = false;

    if (verifierRole === "seller") {
      updateData.verifikasiPenjual = true;
      // Jangan set VERIFIED di sini, tunggu pembeli juga verifikasi
      updateData.verificationStatus = "PENDING";
    } else if (verifierRole === "buyer") {
      // Penjual harus sudah verifikasi dulu
      if (!existing.verifikasiPenjual) {
        return res.status(400).json({
          error: "Penjual harus melakukan verifikasi terlebih dahulu sebelum pembeli dapat verifikasi",
        });
      }
      updateData.verifikasiPembeli = true;
      // Jika kedua pihak sudah verifikasi, baru set VERIFIED
      if (existing.verifikasiPenjual) {
        updateData.verificationStatus = "VERIFIED";
        updateData.timestamp = new Date();

        // Prepare transaction data for IPFS
        const transaksiData = {
          penjualType: existing.penjualType,
          penjualId: existing.penjualId,
          pembeliType: existing.pembeliType,
          pembeliId: existing.pembeliId,
          sapiId: existing.sapiId,
          dagingId: existing.dagingId,
          jumlahQty: existing.jumlahQty,
          type: existing.type,
          timestamp: updateData.timestamp.toISOString(),
          verificationCode: existing.verificationCode,
          verifiedBySeller: true,
          verifiedByBuyer: true,
        };

        // Upload to IPFS and get CID
        let cid = null;
        try {
          const transaksiDataString = JSON.stringify(transaksiData);
          cid = await uploadToIPFS(transaksiDataString);
          updateData.cid = cid;
        } catch (ipfsError) {
          console.error("IPFS upload failed:", ipfsError);
          updateData.cid = null;
        }

        // Transfer ownership after both parties verified
        if (existing.sapiId) {
          const ownershipUpdate = {
            peternakId: null,
            pasarHewanId: null,
            jagalId: null,
          };

          if (existing.pembeliType === "PETERNAK") {
            ownershipUpdate.peternakId = existing.pembeliId;
          } else if (existing.pembeliType === "PASAR_HEWAN") {
            ownershipUpdate.pasarHewanId = existing.pembeliId;
          } else if (existing.pembeliType === "JAGAL") {
            ownershipUpdate.jagalId = existing.pembeliId;
          }

          await prisma.sapi.update({
            where: { id: existing.sapiId },
            data: ownershipUpdate,
          });

          // Update entity counters (decrement/increment)
          try {
            if (existing.penjualType === "PETERNAK") {
              await prisma.peternak.update({
                where: { id: existing.penjualId },
                data: { jumlahSapi: { decrement: existing.jumlahQty } },
              });
            } else if (existing.penjualType === "PASAR_HEWAN") {
              await prisma.pasarHewan.update({
                where: { id: existing.penjualId },
                data: { jumlahSapi: { decrement: existing.jumlahQty } },
              });
            } else if (existing.penjualType === "JAGAL") {
              await prisma.jagal.update({
                where: { id: existing.penjualId },
                data: { jumlahSapi: { decrement: existing.jumlahQty } },
              });
            }
            if (existing.pembeliType === "PETERNAK") {
              await prisma.peternak.update({
                where: { id: existing.pembeliId },
                data: { jumlahSapi: { increment: existing.jumlahQty } },
              });
            } else if (existing.pembeliType === "PASAR_HEWAN") {
              await prisma.pasarHewan.update({
                where: { id: existing.pembeliId },
                data: { jumlahSapi: { increment: existing.jumlahQty } },
              });
            } else if (existing.pembeliType === "JAGAL") {
              await prisma.jagal.update({
                where: { id: existing.pembeliId },
                data: { jumlahSapi: { increment: existing.jumlahQty } },
              });
            }
          } catch (counterError) {
            console.error("Error updating entity counter:", counterError);
          }
        }
        isCompleted = true;
      }
    } else {
      return res.status(400).json({ error: 'verifierRole harus berisi "seller" atau "buyer"' });
    }

    // Update the transaction
    const updatedTransaksi = await prisma.transaksiPenjualan.update({
      where: { id },
      data: updateData,
    });

    // Response message
    const responseMessage = isCompleted
      ? "Transaksi berhasil diverifikasi oleh kedua pihak dan tercatat di blockchain!"
      : `Verifikasi ${verifierRole === "seller" ? "penjual" : "pembeli"} berhasil. Menunggu verifikasi pihak lain.`;

    res.status(200).json({
      message: responseMessage,
      data: updatedTransaksi,
      isCompleted,
      cid: updateData.cid || null,
    });

    // Send success email notification if transaction is fully verified
    if (updateData.verificationStatus === "VERIFIED" && updateData.cid) {
      const recipientEmail = "taktujik@gmail.com";
      const successEmailResult = await sendTransactionSuccessEmail(recipientEmail, id, {
        cid: updateData.cid,
        penjualType: existing.penjualType,
        pembeliType: existing.pembeliType,
      });

      if (!successEmailResult.success) {
        console.error("Failed to send success email:", successEmailResult.error);
      }
    }

    // ...existing code...
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

// Legacy verify function for backward compatibility
exports.verifyTransaksiPenjualan = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  try {
    const existing = await prisma.transaksiPenjualan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: `Transaksi Penjualan dengan ID ${id} tidak ditemukan` });
    if (existing.verificationStatus === "REJECTED") {
      return res.status(400).json({ error: "Transaksi telah ditolak" });
    }
    const expected = existing.verificationCode || "";
    if (!code || code !== expected) {
      return res.status(400).json({ error: "Kode verifikasi tidak cocok" });
    }

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
      timestamp: timestamp.toISOString(),
    };

    // Upload to IPFS and get CID
    const transaksiDataString = JSON.stringify(transaksiData);
    const cid = await uploadToIPFS(transaksiDataString);

    // Update transaction: mark verified, set CID
    const updatedTransaksi = await prisma.transaksiPenjualan.update({
      where: { id },
      data: {
        verifikasiPembeli: true,
        verificationStatus: "VERIFIED",
        cid,
        timestamp,
      },
    });

    // Transfer ownership after verification
    if (existing.sapiId) {
      const updateData = {
        peternakId: null,
        pasarHewanId: null,
        jagalId: null,
      };

      // Update ownership based on buyer type
      if (existing.pembeliType === "PETERNAK") {
        updateData.peternakId = existing.pembeliId;
      } else if (existing.pembeliType === "PASAR_HEWAN") {
        updateData.pasarHewanId = existing.pembeliId;
      } else if (existing.pembeliType === "JAGAL") {
        updateData.jagalId = existing.pembeliId;
      } else if (existing.pembeliType === "RPH") {
        // For RPH, we don't transfer ownership to RPH entity
        // Sapi will be converted to daging through transaksiPenyembelihan
        // So we keep ownership null for now
        updateData.peternakId = null;
        updateData.pasarHewanId = null;
        updateData.jagalId = null;
      } else {
        return res.status(400).json({
          error: `Transfer kepemilikan sapi ke ${existing.pembeliType} tidak diizinkan`,
        });
      }

      await prisma.sapi.update({
        where: { id: existing.sapiId },
        data: updateData,
      });

      // Update jumlah sapi for both entities
      if (existing.penjualType === "PETERNAK") {
        await prisma.peternak.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      } else if (existing.penjualType === "PASAR_HEWAN") {
        await prisma.pasarHewan.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      } else if (existing.penjualType === "JAGAL") {
        await prisma.jagal.update({
          where: { id: existing.penjualId },
          data: { jumlahSapi: { decrement: existing.jumlahQty } },
        });
      }

      if (existing.pembeliType === "PETERNAK") {
        await prisma.peternak.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      } else if (existing.pembeliType === "PASAR_HEWAN") {
        await prisma.pasarHewan.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      } else if (existing.pembeliType === "JAGAL") {
        await prisma.jagal.update({
          where: { id: existing.pembeliId },
          data: { jumlahSapi: { increment: existing.jumlahQty } },
        });
      }
    }

    // Transfer ownership for daging transactions
    if (existing.dagingId) {
      console.log('📦 [DAGING TRANSFER] Transferring daging ownership:', {
        dagingId: existing.dagingId,
        fromType: existing.penjualType,
        fromId: existing.penjualId,
        toType: existing.pembeliType,
        toId: existing.pembeliId
      });

      const dagingUpdateData = {
        // Clear previous ownership
        distributorId: null,
        horekaId: null,
        endCustomerId: null,
        sudahDijual: true
      };

      // Set new ownership based on buyer type
      if (existing.pembeliType === "DISTRIBUTOR") {
        dagingUpdateData.distributorId = existing.pembeliId;
      } else if (existing.pembeliType === "HOREKA") {
        dagingUpdateData.horekaId = existing.pembeliId;
      } else if (existing.pembeliType === "END_CUSTOMER") {
        dagingUpdateData.endCustomerId = existing.pembeliId;
      } else {
        console.warn('⚠️ [DAGING TRANSFER] Unsupported buyer type for daging:', existing.pembeliType);
      }

      await prisma.daging.update({
        where: { id: existing.dagingId },
        data: dagingUpdateData,
      });

      console.log('✅ [DAGING TRANSFER] Daging ownership transferred successfully');
    }

    res.status(200).json({ message: "Verifikasi pembeli berhasil. CID dibuat dan kepemilikan ditransfer.", data: updatedTransaksi, ipfsCid: cid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transfer sapi from Pasar Hewan to Jagal (using same OTP verification as transactions)
exports.transferSapi = async (req, res) => {
  const { pasarHewanId, jagalId, sapiId, jumlahQty, notes } = req.body;

  try {
    console.log("Transfer Debug - Request body:", { pasarHewanId, jagalId, sapiId, jumlahQty, notes });

    // Validate Pasar Hewan exists
    const pasarHewan = await prisma.pasarHewan.findUnique({ where: { id: pasarHewanId } });
    console.log("Transfer Debug - Pasar Hewan found:", !!pasarHewan);
    if (!pasarHewan) {
      return res.status(404).json({ error: `Pasar Hewan dengan ID ${pasarHewanId} tidak ditemukan dalam sistem` });
    }

    // Debug: Check all Jagal IDs first
    const allJagals = await prisma.jagal.findMany({ select: { id: true, nama: true, userId: true } });
    console.log("Transfer Debug - All Jagal IDs in database:", allJagals);
    console.log("Transfer Debug - Looking for Jagal ID:", jagalId);
    console.log("Transfer Debug - Jagal ID type:", typeof jagalId);

    // Validate Jagal exists
    const jagal = await prisma.jagal.findUnique({ where: { id: jagalId } });
    console.log("Transfer Debug - Jagal found:", !!jagal, jagal);
    if (!jagal) {
      return res.status(404).json({
        error: `Jagal dengan ID ${jagalId} tidak ditemukan dalam sistem`,
        debug: {
          requestedId: jagalId,
          requestedIdType: typeof jagalId,
          availableJagals: allJagals,
        },
      });
    }

    // Validate sapi exists and is owned by Pasar Hewan
    const sapi = await prisma.sapi.findUnique({ where: { id: sapiId } });
    if (!sapi) {
      return res.status(404).json({ error: `Sapi dengan ID ${sapiId} tidak ditemukan dalam sistem` });
    }

    if (sapi.pasarHewanId !== pasarHewanId) {
      return res.status(400).json({ error: `Sapi dengan ID ${sapiId} tidak dimiliki oleh Pasar Hewan dengan ID ${pasarHewanId}` });
    }

    // Check if Pasar Hewan has enough cattle
    if (pasarHewan.jumlahSapi < jumlahQty) {
      return res.status(400).json({ error: `Pasar Hewan tidak memiliki cukup sapi. Tersedia: ${pasarHewan.jumlahSapi}, diminta: ${jumlahQty}` });
    }

    // Generate verification code using email service
    const verificationCode = generateOTP();

    // Create transfer record as a transaction (using exact same pattern as createTransaksiPenjualan)
    const newTransfer = await prisma.transaksiPenjualan.create({
      data: {
        penjualType: "PASAR_HEWAN",
        penjualId: pasarHewanId,
        pembeliType: "JAGAL",
        pembeliId: jagalId,
        sapiId: sapiId,
        dagingId: null,
        jumlahQty: jumlahQty,
        type: "SAPI",
        verifikasiPenjual: true,
        verifikasiPembeli: false,
        verificationStatus: "PENDING",
        verificationCode: verificationCode,
        notes: notes || null,
      },
    });

    // Send OTP email notification to taktujik@gmail.com (temporary email for testing)
    const recipientEmail = "taktujik@gmail.com";
    const emailResult = await sendOTPEmail(recipientEmail, verificationCode, newTransfer.id, "Transfer Sapi");

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      // Still return success for transfer creation, but log the email error
    }

    res.status(201).json({
      message: "Transfer sapi ke Jagal berhasil dibuat. OTP telah dikirim ke email untuk verifikasi.",
      data: newTransfer,
      emailSent: emailResult.success,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Debug endpoint to check Jagal IDs
exports.debugJagalIds = async (req, res) => {
  try {
    const jagals = await prisma.jagal.findMany({
      select: {
        id: true,
        nama: true,
        userId: true,
      },
    });

    res.status(200).json({
      message: "Debug: All Jagal IDs",
      data: jagals,
      count: jagals.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions for a specific Jagal (both incoming and outgoing)
exports.getJagalTransactions = async (req, res) => {
  const { jagalId } = req.params;

  try {
    // Validate Jagal exists
    const jagal = await prisma.jagal.findUnique({
      where: { id: jagalId },
      select: { id: true, nama: true },
    });

    if (!jagal) {
      return res.status(404).json({ error: `Jagal dengan ID ${jagalId} tidak ditemukan` });
    }

    // Get all transactions where Jagal is either seller or buyer
    const transactions = await prisma.transaksiPenjualan.findMany({
      where: {
        OR: [
          { penjualType: 'JAGAL', penjualId: jagalId },
          { pembeliType: 'JAGAL', pembeliId: jagalId },
        ],
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
            rph: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Enrich data with entity information
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        let sellerName = '';
        let buyerName = '';

        // Get seller name
        try {
          const seller = await prisma[tx.penjualType.toLowerCase()].findUnique({
            where: { id: tx.penjualId },
            select: { nama: true },
          });
          sellerName = seller?.nama || tx.penjualId;
        } catch (e) {
          sellerName = tx.penjualId;
        }

        // Get buyer name
        try {
          const buyer = await prisma[tx.pembeliType.toLowerCase()].findUnique({
            where: { id: tx.pembeliId },
            select: { nama: true },
          });
          buyerName = buyer?.nama || tx.pembeliId;
        } catch (e) {
          buyerName = tx.pembeliId;
        }

        return {
          ...tx,
          sellerName,
          buyerName,
          direction: tx.penjualId === jagalId ? 'outgoing' : 'incoming',
        };
      })
    );

    res.status(200).json({
      message: 'Transaksi Jagal berhasil diambil',
      jagal: jagal,
      total: enrichedTransactions.length,
      outgoing: enrichedTransactions.filter(t => t.direction === 'outgoing').length,
      incoming: enrichedTransactions.filter(t => t.direction === 'incoming').length,
      data: enrichedTransactions,
    });
  } catch (error) {
    console.error('Error getting Jagal transactions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions for a specific Distributor (both incoming and outgoing)
exports.getDistributorTransactions = async (req, res) => {
  const { distributorId } = req.params;

  try {
    // Validate Distributor exists
    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      select: { id: true, namaUsaha: true },
    });

    if (!distributor) {
      return res.status(404).json({ error: `Distributor dengan ID ${distributorId} tidak ditemukan` });
    }

    // Get all transactions where Distributor is either seller or buyer
    const transactions = await prisma.transaksiPenjualan.findMany({
      where: {
        OR: [
          { penjualType: 'DISTRIBUTOR', penjualId: distributorId },
          { pembeliType: 'DISTRIBUTOR', pembeliId: distributorId },
        ],
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
            rph: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Enrich data with entity information
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        let sellerName = '';
        let buyerName = '';

        // Get seller name
        try {
          const sellerModel = tx.penjualType === 'DISTRIBUTOR' ? 'distributor' : tx.penjualType.toLowerCase();
          const seller = await prisma[sellerModel].findUnique({
            where: { id: tx.penjualId },
          });
          sellerName = seller?.nama || seller?.namaUsaha || tx.penjualId;
        } catch (e) {
          sellerName = tx.penjualId;
        }

        // Get buyer name
        try {
          const buyerModel = tx.pembeliType === 'DISTRIBUTOR' ? 'distributor' : tx.pembeliType.toLowerCase();
          const buyer = await prisma[buyerModel].findUnique({
            where: { id: tx.pembeliId },
          });
          buyerName = buyer?.nama || buyer?.namaUsaha || tx.pembeliId;
        } catch (e) {
          buyerName = tx.pembeliId;
        }

        return {
          ...tx,
          sellerName,
          buyerName,
          direction: tx.penjualId === distributorId ? 'outgoing' : 'incoming',
        };
      })
    );

    res.status(200).json({
      message: 'Transaksi Distributor berhasil diambil',
      distributor: distributor,
      total: enrichedTransactions.length,
      outgoing: enrichedTransactions.filter(t => t.direction === 'outgoing').length,
      incoming: enrichedTransactions.filter(t => t.direction === 'incoming').length,
      data: enrichedTransactions,
    });
  } catch (error) {
    console.error('Error getting Distributor transactions:', error);
    res.status(500).json({ error: error.message });
  }
};
