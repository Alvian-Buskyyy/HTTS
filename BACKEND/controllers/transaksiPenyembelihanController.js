const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateOTP, sendOTPEmail, sendTransactionSuccessEmail, sendTransactionCancelEmail } = require("../utils/emailService");
const { uploadToIPFS } = require("../config/ipfs");

// Get all transaksi penyembelihan
exports.getAllTransaksiPenyembelihan = async (req, res) => {
  try {
    const transaksi = await prisma.transaksiPenyembelihan.findMany({
      include: {
        sapi: {
          include: {
            peternak: true,
            pasarHewan: true,
            jagal: true,
          },
        },
        jagal: true,
        rph: true,
        daging: true,
      },
      orderBy: {
        tanggalPendaftaran: "desc",
      },
    });

    res.status(200).json({
      message: "All transaksi penyembelihan retrieved successfully",
      count: transaksi.length,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaksi penyembelihan by ID
exports.getTransaksiPenyembelihanById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id },
      include: {
        sapi: {
          include: {
            peternak: true,
            pasarHewan: true,
            jagal: true,
          },
        },
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    res.status(200).json({
      message: "Transaksi penyembelihan retrieved successfully",
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Get list of sapi owned by Jagal
exports.getSapiJagal = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get sapi owned by this Jagal
    const sapi = await prisma.sapi.findMany({
      where: {
        jagalId: jagal.id,
        isProcessed: false, // Only show unprocessed sapi
      },
      include: {
        peternak: true,
        pasarHewan: true,
        jagal: true,
      },
      orderBy: {
        tanggalPendaftaran: "desc",
      },
    });

    res.status(200).json({
      message: "Sapi milik Jagal retrieved successfully",
      count: sapi.length,
      data: sapi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Get list of RPH
exports.getDaftarRPH = async (req, res) => {
  try {
    const rphList = await prisma.rPH.findMany({
      include: {
        user: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    res.status(200).json({
      message: "Daftar RPH retrieved successfully",
      count: rphList.length,
      data: rphList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Get daging pending verification
exports.getDagingPendingVerifikasiJagal = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get daging that need Jagal's verification (where verifikasiJagal is false)
    const dagingList = await prisma.daging.findMany({
      where: {
        jagalId: jagal.id,
        verifikasiJagal: false,
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Daging pending verifikasi Jagal retrieved successfully",
      count: dagingList.length,
      data: dagingList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Register sapi to RPH for slaughter
exports.jagalDaftarkanSapi = async (req, res) => {
  const { sapiId, rphId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Validate sapi
    const sapi = await prisma.sapi.findUnique({
      where: { id: sapiId },
    });

    if (!sapi) {
      return res.status(404).json({ error: "Sapi tidak ditemukan" });
    }

    if (sapi.jagalId !== jagal.id) {
      return res.status(403).json({ error: "Sapi bukan milik Jagal ini" });
    }

    if (sapi.isProcessed) {
      return res.status(400).json({ error: "Sapi sudah diproses sebelumnya" });
    }

    // Validate RPH
    const rph = await prisma.rPH.findUnique({
      where: { id: rphId },
    });

    if (!rph) {
      return res.status(404).json({ error: "RPH tidak ditemukan" });
    }

    // Create transaksi penyembelihan
    const transaksi = await prisma.transaksiPenyembelihan.create({
      data: {
        sapiId,
        jagalId: jagal.id,
        rphId,
        status: "PENDING_RPH",
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
      },
    });

    res.status(201).json({
      message: "Sapi berhasil didaftarkan ke RPH untuk penyembelihan",
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Request verification code untuk verifikasi hasil penyembelihan
exports.jagalRequestVerificationCode = async (req, res) => {
  const { transaksiId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get jagal profile with user email
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
      include: {
        profiles: {
          include: {
            user: true
          }
        }
      }
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        daging: true,
        sapi: true,
        rph: true
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.jagalId !== jagal.id) {
      return res.status(403).json({ error: "Transaksi bukan milik Jagal ini" });
    }

    if (transaksi.status !== "PENDING_JAGAL_VERIFICATION") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu verifikasi Jagal" });
    }

    // Generate 6-digit verification code (OTP)
    const verificationCode = generateOTP();

    // Save verification code to database
    await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        verificationCode,
      }
    });

    // Send OTP via email to Jagal
    const jagalEmail = 'taktujik@gmail.com';
    await sendOTPEmail(
      jagalEmail,
      verificationCode,
      transaksiId,
      `Verifikasi Hasil Penyembelihan - ${transaksi.sapi?.jenis || 'Sapi'} di ${transaksi.rph?.nama || 'RPH'}`
    );
    
    res.status(200).json({
      message: "Kode verifikasi berhasil dikirim ke email Anda",
      verificationCode: verificationCode,
      emailSent: !!jagalEmail,
      expiresIn: "10 menit",
      transaksiId: transaksi.id,
      dagingId: transaksi.daging?.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regulator: Request verification code for joint verification
exports.regulatorRequestVerificationCode = async (req, res) => {
  const { transaksiId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get regulator profile with user email
    const regulator = await prisma.regulator.findUnique({
      where: { userId },
      include: {
        profiles: {
          include: {
            user: true
          }
        }
      }
    });

    if (!regulator) {
      return res.status(404).json({ error: "Profil Regulator tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        daging: true,
        sapi: true,
        rph: true,
        jagal: {
          include: {
            profiles: {
              include: {
                user: true
              }
            }
          }
        }
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.status !== "PENDING_REGULATOR_VERIFICATION" && transaksi.status !== "PENDING_JAGAL_VERIFICATION") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu verifikasi" });
    }

    // Check if Jagal has already verified (has verificationCode)
    if (!transaksi.verificationCode) {
      return res.status(400).json({ error: "Jagal belum memulai verifikasi. Mohon tunggu Jagal untuk request verifikasi terlebih dahulu." });
    }

    // Generate new verification code for Regulator
    const regulatorCode = generateOTP();

    // Send OTP via email to Regulator
    const regulatorEmail = 'taktujik@gmail.com';
    await sendOTPEmail(
      regulatorEmail,
      regulatorCode,
      transaksiId,
      `Verifikasi Halal Penyembelihan - ${transaksi.sapi?.jenis || 'Sapi'} di ${transaksi.rph?.nama || 'RPH'}`
    );

    // Also share Jagal's verification code with Regulator
    res.status(200).json({
      message: "Kode verifikasi berhasil dikirim ke email Anda",
      regulatorCode,
      jagalCode: transaksi.verificationCode,
      emailSent: !!regulatorEmail,
      expiresIn: "10 menit",
      transaksiInfo: {
        sapiJenis: transaksi.sapi?.jenis,
        rphNama: transaksi.rph?.nama,
        jagalNama: transaksi.jagal?.nama,
        dagingId: transaksi.daging?.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Verify slaughter result
exports.jagalVerifikasiHasil = async (req, res) => {
  const { transaksiId, dagingId, verificationCode } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get transaksi by dagingId if provided, otherwise use transaksiId
    let transaksi;
    if (dagingId) {
      transaksi = await prisma.transaksiPenyembelihan.findFirst({
        where: { dagingId },
        include: {
          sapi: true,
          daging: true,
        },
      });
    } else if (transaksiId) {
      transaksi = await prisma.transaksiPenyembelihan.findUnique({
        where: { id: transaksiId },
        include: {
          sapi: true,
          daging: true,
        },
      });
    }

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.jagalId !== jagal.id) {
      return res.status(403).json({ error: "Transaksi bukan milik Jagal ini" });
    }

    if (transaksi.status !== "PENDING_JAGAL_VERIFICATION") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu verifikasi Jagal" });
    }

    // Validate verification code matches the one in database
    if (!transaksi.verificationCode) {
      return res.status(400).json({ error: "Kode verifikasi belum dibuat. Silakan request kode verifikasi terlebih dahulu." });
    }

    if (transaksi.verificationCode !== verificationCode) {
      return res.status(400).json({ error: "Kode verifikasi tidak valid" });
    }

    // Check if code is expired (10 minutes)
    const codeAge = Date.now() - new Date(transaksi.updatedAt).getTime();
    if (codeAge > 10 * 60 * 1000) {
      return res.status(400).json({ error: "Kode verifikasi sudah kadaluarsa. Silakan request kode baru." });
    }

    // Update daging verifikasiJagal
    if (transaksi.daging) {
      await prisma.daging.update({
        where: { id: transaksi.daging.id },
        data: { verifikasiJagal: true },
      });
    }

    // Check if regulator also verified
    const checkDaging = await prisma.daging.findUnique({
      where: { id: transaksi.daging.id },
    });

    const isCompleted = checkDaging.verifikasiRegulator === true;

    // If both verified, update status and mark sapi as processed
    if (isCompleted) {
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "VERIFIED",
          jagalVerifiedAt: new Date(),
        },
      });

      await prisma.daging.update({
        where: { id: transaksi.daging.id },
        data: {
          statusHalal: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      // **TRANSFER KEPEMILIKAN: Sapi hilang dari Jagal**
      await prisma.sapi.update({
        where: { id: transaksi.sapiId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
          jagalId: null, // Sapi tidak lagi milik Jagal
        },
      });

      // Update jumlah sapi dan daging Jagal
      await prisma.jagal.update({
        where: { id: jagal.id },
        data: {
          jumlahSapi: { decrement: 1 },
          jumlahDaging: { increment: 1 },
        },
      });
    } else {
      // Only Jagal verified, waiting for Regulator
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "PENDING_REGULATOR_VERIFICATION",
          jagalVerifiedAt: new Date(),
        },
      });
    }

    const updated = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksi.id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    res.status(200).json({
      message: isCompleted 
        ? "Hasil penyembelihan berhasil diverifikasi! Sapi telah ditransfer menjadi paket daging."
        : "Hasil penyembelihan berhasil diverifikasi oleh Jagal. Menunggu verifikasi Regulator.",
      data: updated,
      isCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regulator: Verify halal result
exports.regulatorVerifikasiHasil = async (req, res) => {
  const { dagingId, jagalCode, regulatorCode } = req.body;

  try {
    const userId = req.user.userId;
    const regulator = await prisma.regulator.findUnique({
      where: { userId },
    });

    if (!regulator) {
      return res.status(404).json({ error: "Profil Regulator tidak ditemukan" });
    }

    // Get transaksi by dagingId
    const transaksi = await prisma.transaksiPenyembelihan.findFirst({
      where: { dagingId },
      include: {
        daging: true,
        sapi: true,
        jagal: true,
        rph: true,
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.status !== "PENDING_REGULATOR_VERIFICATION" && transaksi.status !== "PENDING_JAGAL_VERIFICATION") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu verifikasi" });
    }

    // Validate Jagal's verification code
    if (!transaksi.verificationCode) {
      return res.status(400).json({ error: "Jagal belum memulai verifikasi" });
    }

    if (transaksi.verificationCode !== jagalCode) {
      return res.status(400).json({ error: "Kode verifikasi Jagal tidak valid" });
    }

    // In production, validate regulatorCode against database/session
    // For now, just check it's a 6-digit code
    if (!/^\d{6}$/.test(regulatorCode)) {
      return res.status(400).json({ error: "Kode verifikasi Regulator tidak valid" });
    }

    // Update daging verifikasiRegulator
    await prisma.daging.update({
      where: { id: dagingId },
      data: { verifikasiRegulator: true },
    });

    // Check if Jagal also verified
    const checkDaging = await prisma.daging.findUnique({
      where: { id: dagingId },
    });

    const isCompleted = checkDaging.verifikasiJagal === true;

    // If both verified, update status and mark sapi as processed
    if (isCompleted) {
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "VERIFIED",
          regulatorVerifiedAt: new Date(),
        },
      });

      await prisma.daging.update({
        where: { id: dagingId },
        data: {
          statusHalal: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      // **TRANSFER KEPEMILIKAN: Sapi hilang dari Jagal**
      await prisma.sapi.update({
        where: { id: transaksi.sapiId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
          jagalId: null,
        },
      });

      // Update jumlah sapi dan daging Jagal
      await prisma.jagal.update({
        where: { id: transaksi.jagalId },
        data: {
          jumlahSapi: { decrement: 1 },
          jumlahDaging: { increment: 1 },
        },
      });
    } else {
      // Only Regulator verified, waiting for Jagal
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "PENDING_JAGAL_VERIFICATION",
          regulatorVerifiedAt: new Date(),
        },
      });
    }

    const updated = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksi.id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    res.status(200).json({
      message: isCompleted 
        ? "Verifikasi lengkap! Status halal telah diperbarui menjadi VERIFIED."
        : "Verifikasi Regulator berhasil. Menunggu verifikasi dari Jagal.",
      data: updated,
      isCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get daging pending verification for Regulator
exports.getDagingPendingRegulator = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const regulator = await prisma.regulator.findUnique({
      where: { userId },
    });

    if (!regulator) {
      return res.status(404).json({ error: "Profil Regulator tidak ditemukan" });
    }

    // Get all daging that need Regulator's verification
    const dagingList = await prisma.daging.findMany({
      where: {
        verifikasiRegulator: false,
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Daging pending verifikasi Regulator retrieved successfully",
      count: dagingList.length,
      data: dagingList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Get all daging milik Jagal (verified and unverified)
exports.getAllDagingJagal = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get all daging that belongs to this Jagal
    const dagingList = await prisma.daging.findMany({
      where: {
        jagalId: jagal.id,
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: {
          include: {
            checklist: {
              include: {
                itemChecklist: true,
              }
            }
          }
        },
        transaksiPenjualan: true,
        qr: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const stats = {
      total: dagingList.length,
      verified: dagingList.filter(d => d.statusHalal === 'VERIFIED').length,
      pending: dagingList.filter(d => d.statusHalal === 'PENDING').length,
      rejected: dagingList.filter(d => d.statusHalal === 'REJECTED').length,
      totalBerat: dagingList.reduce((sum, d) => sum + parseFloat(d.totalBerat || 0), 0),
      terjual: dagingList.filter(d => d.transaksiPenjualan && d.transaksiPenjualan.length > 0).length,
      tersedia: dagingList.filter(d => !d.transaksiPenjualan || d.transaksiPenjualan.length === 0).length,
    };

    res.status(200).json({
      message: "Daging milik Jagal retrieved successfully",
      stats,
      data: dagingList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Jagal: Get detail daging by ID
exports.getDagingDetailJagal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Get jagal profile
    const jagal = await prisma.jagal.findUnique({
      where: { userId },
    });

    if (!jagal) {
      return res.status(404).json({ error: "Profil Jagal tidak ditemukan" });
    }

    // Get daging detail
    const daging = await prisma.daging.findUnique({
      where: { id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: {
          include: {
            checklist: {
              include: {
                itemChecklist: true,
              }
            }
          }
        },
        transaksiPenjualan: true,
        qr: true,
      },
    });

    if (!daging) {
      return res.status(404).json({ error: "Daging tidak ditemukan" });
    }

    if (daging.jagalId !== jagal.id) {
      return res.status(403).json({ error: "Daging bukan milik Jagal ini" });
    }

    res.status(200).json({
      message: "Detail daging retrieved successfully",
      data: daging,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 

// RPH: Get sapi pending for processing
exports.getSapiPendingRPH = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query; // Optional status filter (can be comma-separated)
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Build where clause
    const whereClause = {
      rphId: rph.id,
    };

    // Add status filter if provided
    if (status) {
      // Support comma-separated statuses (e.g., "PENDING_RPH,CHECKLIST_PRA")
      const statusList = status.split(',').map(s => s.trim());
      if (statusList.length === 1) {
        whereClause.status = statusList[0];
      } else {
        whereClause.status = { in: statusList };
      }
    } else {
      // Default: show PENDING_RPH, CHECKLIST_PRA, READY_TO_SLAUGHTER, SLAUGHTERING, CHECKLIST_PASCA, PENDING_INPUT_HASIL
      whereClause.status = {
        in: ["PENDING_RPH", "CHECKLIST_PRA", "READY_TO_SLAUGHTER", "SLAUGHTERING", "CHECKLIST_PASCA", "PENDING_INPUT_HASIL"]
      };
    }

    // Get transaksi penyembelihan for this RPH
    const transaksi = await prisma.transaksiPenyembelihan.findMany({
      where: whereClause,
      include: {
        sapi: {
          include: {
            peternak: true,
            pasarHewan: true,
            jagal: true,
          },
        },
        jagal: true,
        rph: true,
      },
      orderBy: {
        tanggalPendaftaran: "desc",
      },
    });

    res.status(200).json({
      message: "Sapi untuk RPH retrieved successfully",
      count: transaksi.length,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Process slaughter
exports.rphProsesPenyembelihan = async (req, res) => {
  const { transaksiId, beratDaging, beratJeroan, beratTulang } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        sapi: true,
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.rphId !== rph.id) {
      return res.status(403).json({ error: "Transaksi bukan untuk RPH ini" });
    }

    if (transaksi.status !== "PENDING_RPH") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu proses RPH" });
    }

    if (transaksi.sapi.isProcessed) {
      return res.status(400).json({ error: "Sapi sudah diproses sebelumnya" });
    }

    // Generate verification code
    const verificationCode = generateOTP();

    // Create daging record
    const daging = await prisma.daging.create({
      data: {
        sapiId: transaksi.sapiId,
        jagalId: transaksi.jagalId,
        rphId: rph.id,
        beratDaging,
        beratJeroan,
        beratTulang,
        totalBerat: beratDaging + beratJeroan + beratTulang,
        statusHalal: "PENDING",
      },
    });

    // Update transaksi
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "PENDING_JAGAL_VERIFICATION",
        verificationCode,
        dagingId: daging.id,
        processedAt: new Date(),
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    // Update sapi status
    await prisma.sapi.update({
      where: { id: transaksi.sapiId },
      data: {
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    res.status(200).json({
      message: "Penyembelihan berhasil diproses. Menunggu verifikasi Jagal.",
      data: updated,
      verificationCode,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regulator: Get daging pending verification
exports.getDagingPendingVerifikasi = async (req, res) => {
  try {
    // Get transaksi penyembelihan pending regulator verification
    const transaksi = await prisma.transaksiPenyembelihan.findMany({
      where: {
        status: "PENDING_REGULATOR_VERIFICATION",
      },
      include: {
        sapi: {
          include: {
            peternak: true,
            pasarHewan: true,
            jagal: true,
          },
        },
        jagal: true,
        rph: true,
        daging: true,
      },
      orderBy: {
        tanggalPendaftaran: "desc",
      },
    });

    res.status(200).json({
      message: "Daging pending verifikasi halal retrieved successfully",
      count: transaksi.length,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regulator: Verify halal certification
exports.regulatorVerifikasiHalal = async (req, res) => {
  const { transaksiId, dagingId, isHalal } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get regulator profile
    const regulator = await prisma.regulator.findUnique({
      where: { userId },
    });

    if (!regulator) {
      return res.status(404).json({ error: "Profil Regulator tidak ditemukan" });
    }

    // Get transaksi by dagingId if provided, otherwise use transaksiId
    let transaksi;
    if (dagingId) {
      transaksi = await prisma.transaksiPenyembelihan.findFirst({
        where: { dagingId },
        include: {
          sapi: true,
          daging: true,
        },
      });
    } else if (transaksiId) {
      transaksi = await prisma.transaksiPenyembelihan.findUnique({
        where: { id: transaksiId },
        include: {
          sapi: true,
          daging: true,
        },
      });
    }

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.status !== "PENDING_REGULATOR_VERIFICATION" && transaksi.status !== "PENDING_JAGAL_VERIFICATION") {
      return res.status(400).json({ error: "Transaksi tidak dalam status menunggu verifikasi" });
    }

    // Default isHalal to true if not provided (for accept action)
    const halalStatus = isHalal !== undefined ? isHalal : true;

    // Update daging verifikasiRegulator
    if (transaksi.daging) {
      await prisma.daging.update({
        where: { id: transaksi.daging.id },
        data: { verifikasiRegulator: halalStatus },
      });
    }

    // Check if jagal also verified
    const checkDaging = await prisma.daging.findUnique({
      where: { id: transaksi.daging.id },
    });

    const isCompleted = checkDaging.verifikasiJagal === true && halalStatus === true;

    // Prepare data for IPFS if completed or rejected
    let cid = transaksi.cid;
    if (isCompleted || !halalStatus) {
      const transaksiData = {
        transaksiId: transaksi.id,
        sapiId: transaksi.sapiId,
        jagalId: transaksi.jagalId,
        rphId: transaksi.rphId,
        dagingId: transaksi.dagingId,
        statusHalal: halalStatus ? "VERIFIED" : "REJECTED",
        regulatorId: regulator.id,
        verifiedAt: new Date().toISOString(),
        verifikasiJagal: checkDaging.verifikasiJagal,
        verifikasiRegulator: halalStatus,
      };

      // Upload to IPFS
      cid = await uploadToIPFS(JSON.stringify(transaksiData));
    }

    // If both verified, update status and TRANSFER KEPEMILIKAN
    if (isCompleted) {
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "VERIFIED",
          regulatorVerifiedAt: new Date(),
          cid,
        },
      });

      await prisma.daging.update({
        where: { id: transaksi.daging.id },
        data: {
          statusHalal: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      // **TRANSFER KEPEMILIKAN: Sapi hilang dari Jagal**
      await prisma.sapi.update({
        where: { id: transaksi.sapiId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
          jagalId: null, // Sapi tidak lagi milik Jagal
        },
      });

      // Get jagal to update counters
      const jagal = await prisma.jagal.findUnique({
        where: { id: transaksi.jagalId },
      });

      if (jagal) {
        // Update jumlah sapi dan daging Jagal
        await prisma.jagal.update({
          where: { id: jagal.id },
          data: {
            jumlahSapi: { decrement: 1 },
            jumlahDaging: { increment: 1 },
          },
        });
      }
    } else if (!halalStatus) {
      // Rejected by regulator
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "REJECTED",
          regulatorVerifiedAt: new Date(),
          cid,
        },
      });

      await prisma.daging.update({
        where: { id: transaksi.daging.id },
        data: {
          statusHalal: "REJECTED",
        },
      });
    } else {
      // Only Regulator verified, waiting for Jagal
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksi.id },
        data: {
          status: "PENDING_JAGAL_VERIFICATION",
          regulatorVerifiedAt: new Date(),
        },
      });
    }

    const updated = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksi.id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    res.status(200).json({
      message: !halalStatus 
        ? "Penyembelihan ditolak oleh Regulator" 
        : isCompleted
        ? "Penyembelihan berhasil diverifikasi halal! Sapi telah ditransfer menjadi paket daging."
        : "Penyembelihan berhasil diverifikasi oleh Regulator. Menunggu verifikasi Jagal.",
      data: updated,
      ipfsCid: cid,
      isCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction history
exports.getRiwayatTransaksiPenyembelihan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = {};

    // Filter based on user role
    if (userRole === "JAGAL") {
      const jagal = await prisma.jagal.findUnique({ where: { userId } });
      if (jagal) {
        whereClause.jagalId = jagal.id;
      }
    } else if (userRole === "RPH") {
      const rph = await prisma.rPH.findUnique({ where: { userId } });
      if (rph) {
        whereClause.rphId = rph.id;
      }
    }

    const transaksi = await prisma.transaksiPenyembelihan.findMany({
      where: whereClause,
      include: {
        sapi: {
          include: {
            peternak: true,
            pasarHewan: true,
            jagal: true,
          },
        },
        jagal: true,
        rph: true,
        daging: true,
      },
      orderBy: {
        tanggalPendaftaran: "desc",
      },
    });

    res.status(200).json({
      message: "Riwayat transaksi penyembelihan retrieved successfully",
      count: transaksi.length,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
exports.getStatistikPenyembelihan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = {};

    // Filter based on user role
    if (userRole === "JAGAL") {
      const jagal = await prisma.jagal.findUnique({ where: { userId } });
      if (jagal) {
        whereClause.jagalId = jagal.id;
      }
    } else if (userRole === "RPH") {
      const rph = await prisma.rPH.findUnique({ where: { userId } });
      if (rph) {
        whereClause.rphId = rph.id;
      }
    }

    const totalTransaksi = await prisma.transaksiPenyembelihan.count({ where: whereClause });
    const pendingRPH = await prisma.transaksiPenyembelihan.count({
      where: { ...whereClause, status: "PENDING_RPH" },
    });
    const pendingJagal = await prisma.transaksiPenyembelihan.count({
      where: { ...whereClause, status: "PENDING_JAGAL_VERIFICATION" },
    });
    const pendingRegulator = await prisma.transaksiPenyembelihan.count({
      where: { ...whereClause, status: "PENDING_REGULATOR_VERIFICATION" },
    });
    const verified = await prisma.transaksiPenyembelihan.count({
      where: { ...whereClause, status: "VERIFIED" },
    });
    const rejected = await prisma.transaksiPenyembelihan.count({
      where: { ...whereClause, status: "REJECTED" },
    });

    res.status(200).json({
      message: "Statistik penyembelihan retrieved successfully",
      data: {
        total: totalTransaksi,
        pendingRPH,
        pendingJagal,
        pendingRegulator,
        verified,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.processSlaughter = async (req, res) => {
  const { transaksiId, dagingBerat, jeroanBerat, tulangBerat, rphId } = req.body;

  try {
    // Validasi transaksi penyembelihan
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: { sapi: true, rph: true },
    });

    if (!transaksiPenyembelihan) {
      return res.status(404).json({ error: `Transaksi penyembelihan dengan ID ${transaksiId} tidak ditemukan` });
    }

    // Validasi jika sapi sudah diproses
    if (transaksiPenyembelihan.sapi.isProcessed) {
      return res.status(400).json({ error: "Sapi sudah diproses sebelumnya" });
    }

    // Memasukkan berat daging, jeroan, dan tulang
    const updatedTransaksi = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "PROCESSED", // Tandai transaksi sudah diproses
        sapi: {
          update: {
            isProcessed: true, // Tandai sapi sudah diproses
            processedAt: new Date(),
          },
        },
      },
    });

    // Membuat paket daging
    const daging = await prisma.daging.create({
      data: {
        sapiId: transaksiPenyembelihan.sapiId,
        jagalId: transaksiPenyembelihan.jagalId,
        rphId: rphId, // RPH yang memproses penyembelihan
        beratDaging: dagingBerat,
        beratJeroan: jeroanBerat,
        beratTulang: tulangBerat,
        totalBerat: dagingBerat + jeroanBerat + tulangBerat,
      },
    });

    // Kirimkan kode verifikasi bersama kepada RPH dan Regulator
    const verificationCode = generateOTP();

    // Update transaksi untuk memasukkan kode verifikasi
    const updatedTransaction = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        verificationCode: verificationCode,
        status: "PENDING_VERIFICATION", // Status menunggu verifikasi
      },
    });

    // Kirim email untuk verifikasi kepada RPH dan Regulator
    await sendVerificationEmails(transaksiPenyembelihan.rphId, verificationCode, updatedTransaction.id);

    res.status(200).json({
      message: "Proses penyembelihan berhasil. Verifikasi diperlukan dari RPH dan Regulator.",
      data: daging,
      verificationCode: verificationCode,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk mengirimkan email verifikasi
const sendVerificationEmails = async (rphId, verificationCode, transaksiId) => {
  try {
    const rph = await prisma.rPH.findUnique({
      where: { id: rphId },
      include: { user: true },
    });

    if (rph && rph.user && rph.user.email) {
      const emailResult = await sendTransactionSuccessEmail(rph.user.email, verificationCode, transaksiId, "Verifikasi Penyembelihan");
      if (!emailResult.success) {
        console.error("Failed to send verification email to RPH:", emailResult.error);
      }
    }

    // Kirim email ke Regulator juga (jika ada)
    const regulators = await prisma.regulator.findMany({
      include: { user: true },
    });

    for (let regulator of regulators) {
      if (regulator.user && regulator.user.email) {
        const emailResult = await sendTransactionSuccessEmail(regulator.user.email, verificationCode, transaksiId, "Verifikasi Penyembelihan");
        if (!emailResult.success) {
          console.error("Failed to send verification email to Regulator:", emailResult.error);
        }
      }
    }
  } catch (error) {
    console.error("Error sending verification emails:", error);
  }
};

exports.verifyHalalSlaughter = async (req, res) => {
  const { transaksiId, verificationCode, regulatorId } = req.body;

  try {
    // Validasi transaksi
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: { sapi: true, rph: true },
    });

    if (!transaksiPenyembelihan) {
      return res.status(404).json({ error: `Transaksi penyembelihan dengan ID ${transaksiId} tidak ditemukan` });
    }

    // Validasi kode verifikasi
    if (transaksiPenyembelihan.verificationCode !== verificationCode) {
      return res.status(400).json({ error: "Kode verifikasi tidak cocok" });
    }

    // Verifikasi halal oleh regulator
    const regulator = await prisma.regulator.findUnique({
      where: { id: regulatorId },
    });

    if (!regulator) {
      return res.status(404).json({ error: `Regulator dengan ID ${regulatorId} tidak ditemukan` });
    }

    // Update status verifikasi halal
    const updatedTransaksi = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "VERIFIED", // Tandai transaksi telah diverifikasi
        sapi: {
          update: {
            isProcessed: true,
            processedAt: new Date(),
          },
        },
      },
    });

    // Transfer kepemilikan daging kepada Jagal
    const daging = await prisma.daging.update({
      where: { sapiId: transaksiPenyembelihan.sapiId },
      data: {
        statusHalal: "VERIFIED",
      },
    });

    res.status(200).json({
      message: "Penyembelihan telah diverifikasi halal oleh regulator. Daging siap diproses lebih lanjut.",
      data: updatedTransaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// REGULATOR: KELOLA CHECKLIST HALAL
// ==========================================

// Get all checklist items
exports.getAllChecklistHalal = async (req, res) => {
  try {
    const items = await prisma.itemChecklistHalal.findMany({
      where: { isAktif: true },
      include: {
        regulator: {
          select: {
            id: true,
            nama: true,
            instansi: true,
          },
        },
      },
      orderBy: [
        { tipe: 'asc' },
        { urutan: 'asc' }
      ],
    });

    res.status(200).json({
      message: "Checklist halal retrieved successfully",
      data: items,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create checklist item (Regulator only)
exports.createChecklistHalal = async (req, res) => {
  const { pertanyaan, tipe, kategori, urutan } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get regulator profile
    const regulator = await prisma.regulator.findUnique({
      where: { userId },
    });

    if (!regulator) {
      return res.status(404).json({ error: "Profil Regulator tidak ditemukan" });
    }

    if (!['PRA_PENYEMBELIHAN', 'PASCA_PENYEMBELIHAN'].includes(tipe)) {
      return res.status(400).json({ error: "Tipe checklist harus PRA_PENYEMBELIHAN atau PASCA_PENYEMBELIHAN" });
    }

    const item = await prisma.itemChecklistHalal.create({
      data: {
        pertanyaan,
        tipe,
        kategori,
        urutan: urutan || 0,
        regulatorId: regulator.id,
      },
    });

    res.status(201).json({
      message: "Item checklist berhasil dibuat",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update checklist item
exports.updateChecklistHalal = async (req, res) => {
  const { id } = req.params;
  const { pertanyaan, tipe, kategori, urutan, isAktif } = req.body;

  try {
    const item = await prisma.itemChecklistHalal.update({
      where: { id },
      data: {
        pertanyaan,
        tipe,
        kategori,
        urutan,
        isAktif,
      },
    });

    res.status(200).json({
      message: "Item checklist berhasil diupdate",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete checklist item (soft delete)
exports.deleteChecklistHalal = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.itemChecklistHalal.update({
      where: { id },
      data: { isAktif: false },
    });

    res.status(200).json({
      message: "Item checklist berhasil dinonaktifkan",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// RPH: PROSES CHECKLIST & PENYEMBELIHAN
// ==========================================

// Get transaksi detail dengan checklist
exports.getTransaksiWithChecklist = async (req, res) => {
  const { id } = req.params;

  try {
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        checklist: {
          include: {
            itemChecklist: true,
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({
      message: "Transaksi detail retrieved successfully",
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Mulai checklist pra-penyembelihan
exports.rphMulaiChecklistPra = async (req, res) => {
  const { transaksiId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.rphId !== rph.id) {
      return res.status(403).json({ error: "Transaksi bukan untuk RPH ini" });
    }

    if (transaksi.status !== "PENDING_RPH") {
      return res.status(400).json({ error: "Transaksi tidak dalam status PENDING_RPH" });
    }

    // Get all active pra-penyembelihan checklist items
    const checklistItems = await prisma.itemChecklistHalal.findMany({
      where: {
        tipe: "PRA_PENYEMBELIHAN",
        isAktif: true,
      },
      orderBy: {
        urutan: 'asc'
      }
    });

    // Create checklist entries for this transaksi
    const checklistData = checklistItems.map(item => ({
      transaksiPenyembelihanId: transaksiId,
      itemChecklistId: item.id,
      isChecked: false,
    }));

    await prisma.checklistPenyembelihan.createMany({
      data: checklistData,
      skipDuplicates: true,
    });

    // Update transaksi status
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "CHECKLIST_PRA",
      },
      include: {
        sapi: true,
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Checklist pra-penyembelihan dimulai",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Update jawaban checklist
exports.rphUpdateChecklist = async (req, res) => {
  const { checklistId, isChecked, catatan } = req.body;

  try {
    const userId = req.user.userId;

    const updated = await prisma.checklistPenyembelihan.update({
      where: { id: checklistId },
      data: {
        isChecked,
        catatan,
        checkedBy: userId,
        checkedAt: new Date(),
      },
      include: {
        itemChecklist: true,
      },
    });

    res.status(200).json({
      message: "Checklist updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Submit checklist pra-penyembelihan
exports.rphSubmitChecklistPra = async (req, res) => {
  const { transaksiId, answers } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.status !== "CHECKLIST_PRA") {
      return res.status(400).json({ error: "Transaksi tidak dalam status CHECKLIST_PRA" });
    }

    // Update checklist answers first
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        // Find existing checklist entry
        const existingChecklist = await prisma.checklistPenyembelihan.findFirst({
          where: {
            transaksiPenyembelihanId: transaksiId,
            itemChecklistId: answer.itemChecklistId,
          },
        });

        if (existingChecklist) {
          // Update existing checklist
          await prisma.checklistPenyembelihan.update({
            where: { id: existingChecklist.id },
            data: {
              isChecked: answer.isChecked,
              catatan: answer.catatan || null,
              checkedBy: userId,
              checkedAt: new Date(),
            },
          });
        }
      }
    }

    // Re-fetch transaksi to get updated checklist
    const updatedTransaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    // Validasi: semua checklist pra harus sudah dicek
    const checklistPra = updatedTransaksi.checklist.filter(c => c.itemChecklist.tipe === "PRA_PENYEMBELIHAN");
    const allChecked = checklistPra.every(c => c.isChecked === true);

    if (!allChecked) {
      return res.status(400).json({ 
        error: "Semua item checklist pra-penyembelihan harus dicek terlebih dahulu",
        uncheckedItems: checklistPra.filter(c => !c.isChecked).map(c => c.itemChecklist.pertanyaan)
      });
    }

    // Update transaksi
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "READY_TO_SLAUGHTER",
        checklistPraLengkap: true,
        tanggalChecklistPra: new Date(),
      },
      include: {
        sapi: true,
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Checklist pra-penyembelihan lengkap. Sapi siap disembelih.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Mulai proses penyembelihan
exports.rphMulaiPenyembelihan = async (req, res) => {
  const { transaksiId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.status !== "READY_TO_SLAUGHTER") {
      return res.status(400).json({ error: "Transaksi belum siap untuk disembelih" });
    }

    // Update status
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "SLAUGHTERING",
        tanggalPenyembelihan: new Date(),
      },
      include: {
        sapi: true,
      },
    });

    res.status(200).json({
      message: "Proses penyembelihan dimulai",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Mulai checklist pasca-penyembelihan
exports.rphMulaiChecklistPasca = async (req, res) => {
  const { transaksiId } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.status !== "SLAUGHTERING") {
      return res.status(400).json({ error: "Transaksi tidak dalam status SLAUGHTERING" });
    }

    // Get all active pasca-penyembelihan checklist items
    const checklistItems = await prisma.itemChecklistHalal.findMany({
      where: {
        tipe: "PASCA_PENYEMBELIHAN",
        isAktif: true,
      },
      orderBy: {
        urutan: 'asc'
      }
    });

    // Create checklist entries for this transaksi
    const checklistData = checklistItems.map(item => ({
      transaksiPenyembelihanId: transaksiId,
      itemChecklistId: item.id,
      isChecked: false,
    }));

    await prisma.checklistPenyembelihan.createMany({
      data: checklistData,
      skipDuplicates: true,
    });

    // Update transaksi status
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "CHECKLIST_PASCA",
      },
      include: {
        sapi: true,
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Checklist pasca-penyembelihan dimulai",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Submit checklist pasca-penyembelihan
exports.rphSubmitChecklistPasca = async (req, res) => {
  const { transaksiId, answers } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.status !== "CHECKLIST_PASCA") {
      return res.status(400).json({ error: "Transaksi tidak dalam status CHECKLIST_PASCA" });
    }

    // Update checklist answers first
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        // Find existing checklist entry
        const existingChecklist = await prisma.checklistPenyembelihan.findFirst({
          where: {
            transaksiPenyembelihanId: transaksiId,
            itemChecklistId: answer.itemChecklistId,
          },
        });

        if (existingChecklist) {
          // Update existing checklist
          await prisma.checklistPenyembelihan.update({
            where: { id: existingChecklist.id },
            data: {
              isChecked: answer.isChecked,
              catatan: answer.catatan || null,
              checkedBy: userId,
              checkedAt: new Date(),
            },
          });
        }
      }
    }

    // Re-fetch transaksi to get updated checklist
    const updatedTransaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    // Validasi: semua checklist pasca harus sudah dicek
    const checklistPasca = updatedTransaksi.checklist.filter(c => c.itemChecklist.tipe === "PASCA_PENYEMBELIHAN");
    const allChecked = checklistPasca.every(c => c.isChecked === true);

    if (!allChecked) {
      return res.status(400).json({ 
        error: "Semua item checklist pasca-penyembelihan harus dicek terlebih dahulu",
        uncheckedItems: checklistPasca.filter(c => !c.isChecked).map(c => c.itemChecklist.pertanyaan)
      });
    }

    // Update transaksi
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "PENDING_INPUT_HASIL",
        checklistPascaLengkap: true,
        tanggalChecklistPasca: new Date(),
      },
      include: {
        sapi: true,
        checklist: {
          include: {
            itemChecklist: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Checklist pasca-penyembelihan lengkap. Silakan input hasil penyembelihan.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RPH: Input hasil penyembelihan dan create daging (FINAL STEP)
exports.rphInputHasilPenyembelihan = async (req, res) => {
  const { transaksiId, beratDaging, beratJeroan, beratTulang } = req.body;

  try {
    const userId = req.user.userId;
    
    // Get RPH profile
    const rph = await prisma.rPH.findUnique({
      where: { userId },
    });

    if (!rph) {
      return res.status(404).json({ error: "Profil RPH tidak ditemukan" });
    }

    // Get transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        sapi: true,
        daging: true,
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaksi.rphId !== rph.id) {
      return res.status(403).json({ error: "Transaksi bukan untuk RPH ini" });
    }

    if (transaksi.status !== "PENDING_INPUT_HASIL") {
      return res.status(400).json({ error: "Transaksi tidak dalam status PENDING_INPUT_HASIL" });
    }

    if (!transaksi.checklistPraLengkap || !transaksi.checklistPascaLengkap) {
      return res.status(400).json({ error: "Checklist pra dan pasca harus lengkap terlebih dahulu" });
    }

    // Validasi input berat
    if (!beratDaging || !beratJeroan || !beratTulang) {
      return res.status(400).json({ error: "Berat daging, jeroan, dan tulang harus diisi" });
    }

    const totalBerat = parseFloat(beratDaging) + parseFloat(beratJeroan) + parseFloat(beratTulang);

    let daging;
    
    // Check if daging already exists in database (by sapiId)
    const existingDaging = await prisma.daging.findUnique({
      where: { sapiId: transaksi.sapiId },
    });
    
    if (existingDaging) {
      // Update existing daging
      daging = await prisma.daging.update({
        where: { id: existingDaging.id },
        data: {
          beratDaging: parseFloat(beratDaging),
          beratJeroan: parseFloat(beratJeroan),
          beratTulang: parseFloat(beratTulang),
          totalBerat,
          statusHalal: "PENDING",
        },
      });
    } else {
      // Create new daging if doesn't exist
      daging = await prisma.daging.create({
        data: {
          sapiId: transaksi.sapiId,
          jagalId: transaksi.jagalId,
          rphId: rph.id,
          beratDaging: parseFloat(beratDaging),
          beratJeroan: parseFloat(beratJeroan),
          beratTulang: parseFloat(beratTulang),
          totalBerat,
          statusHalal: "PENDING",
        },
      });
    }

    // Update transaksi
    const updated = await prisma.transaksiPenyembelihan.update({
      where: { id: transaksiId },
      data: {
        status: "PENDING_JAGAL_VERIFICATION",
        beratDaging: parseFloat(beratDaging),
        beratJeroan: parseFloat(beratJeroan),
        beratTulang: parseFloat(beratTulang),
        totalBerat,
        dagingId: daging.id,
        tanggalInputHasil: new Date(),
        processedAt: new Date(),
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    res.status(200).json({
      message: "Hasil penyembelihan berhasil diinput. Menunggu verifikasi Jagal.",
      data: updated,
      daging,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

