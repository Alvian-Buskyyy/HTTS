const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadToIPFS } = require("../config/ipfs");

// Generate kode verifikasi halal unik
function generateKodeVerifikasiHalal() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VH-${timestamp}-${random}`;
}

// 1. Jagal mendaftarkan sapi untuk disembelih ke RPH tertentu
exports.jagalDaftarkanSapi = async (req, res) => {
  const { sapiId, rphId } = req.body;
  const { userId } = req.user; // Dari middleware auth

  try {
    // Validasi jagal dari user yang login
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { jagal: true },
    });

    if (!profile || !profile.jagal) {
      return res.status(403).json({ error: "Hanya Jagal yang dapat mendaftarkan sapi untuk penyembelihan" });
    }

    const jagalId = profile.jagal.id;

    // Validasi sapi milik jagal
    const sapi = await prisma.sapi.findUnique({
      where: { id: sapiId },
      include: { jagal: true },
    });

    if (!sapi) {
      return res.status(404).json({ error: "Sapi tidak ditemukan" });
    }

    if (sapi.jagalId !== jagalId) {
      return res.status(403).json({ error: "Sapi bukan milik Anda" });
    }

    // Cek apakah sapi sudah disembelih
    const existingDaging = await prisma.daging.findUnique({ where: { sapiId } });
    if (existingDaging) {
      return res.status(400).json({ error: "Sapi sudah disembelih sebelumnya" });
    }

    // Cek apakah sudah ada transaksi pending untuk sapi ini
    const existingTransaksi = await prisma.transaksiPenyembelihan.findFirst({
      where: {
        sapiId,
        status: "PENDING",
      },
    });

    if (existingTransaksi) {
      return res.status(400).json({ error: "Sapi sudah didaftarkan untuk penyembelihan" });
    }

    // Validasi RPH
    const rph = await prisma.rPH.findUnique({ where: { id: rphId } });
    if (!rph) {
      return res.status(404).json({ error: "RPH tidak ditemukan" });
    }

    // Siapkan data untuk IPFS
    const transaksiData = {
      action: "PENDAFTARAN_PENYEMBELIHAN",
      jagalId,
      rphId,
      sapiId,
      timestamp: new Date().toISOString(),
    };

    const cid = await uploadToIPFS(JSON.stringify(transaksiData));

    // Buat transaksi penyembelihan
    const transaksi = await prisma.transaksiPenyembelihan.create({
      data: {
        jagalId,
        rphId,
        sapiId,
        status: "PENDING",
        cid,
      },
      include: {
        sapi: {
          include: {
            jagal: true,
          },
        },
        rph: true,
      },
    });

    res.status(201).json({
      message: "Sapi berhasil didaftarkan untuk penyembelihan",
      data: transaksi,
      ipfsCid: cid,
    });
  } catch (error) {
    console.error("Error mendaftarkan sapi untuk penyembelihan:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Jagal melihat sapi miliknya yang bisa didaftarkan
exports.getSapiJagal = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { jagal: true },
    });

    if (!profile || !profile.jagal) {
      return res.status(403).json({ error: "Hanya Jagal yang dapat mengakses endpoint ini" });
    }

    const sapiMilikJagal = await prisma.sapi.findMany({
      where: {
        jagalId: profile.jagal.id,
        // Belum ada daging (belum disembelih)
        daging: null,
      },
      include: {
        jagal: true,
      },
    });

    res.status(200).json({
      message: "Daftar sapi milik jagal",
      data: sapiMilikJagal,
    });
  } catch (error) {
    console.error("Error mengambil sapi jagal:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Jagal melihat daftar RPH yang tersedia
exports.getDaftarRPH = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { jagal: true },
    });

    if (!profile || !profile.jagal) {
      return res.status(403).json({ error: "Hanya Jagal yang dapat mengakses endpoint ini" });
    }

    const daftarRPH = await prisma.rPH.findMany({
      select: {
        id: true,
        nama: true,
        alamat: true,
        noTelepon: true,
        sertifikatHalal: true,
        namaJuleha: true,
        noSertifJuleha: true,
      },
    });

    res.status(200).json({
      message: "Daftar RPH yang tersedia",
      data: daftarRPH,
    });
  } catch (error) {
    console.error("Error mengambil daftar RPH:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. RPH melihat sapi yang didaftarkan oleh Jagal ke RPH tersebut
exports.getSapiPendingRPH = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { rph: true },
    });

    if (!profile || !profile.rph) {
      return res.status(403).json({ error: "Hanya RPH yang dapat mengakses endpoint ini" });
    }

    const sapiPending = await prisma.transaksiPenyembelihan.findMany({
      where: {
        rphId: profile.rph.id,
        status: "PENDING",
      },
      include: {
        sapi: {
          include: {
            jagal: true,
          },
        },
        jagal: true,
      },
    });

    res.status(200).json({
      message: "Daftar sapi yang didaftarkan untuk penyembelihan di RPH ini",
      data: sapiPending,
    });
  } catch (error) {
    console.error("Error mengambil sapi pending RPH:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. RPH memproses penyembelihan (input hasil penyembelihan)
exports.rphProsesPenyembelihan = async (req, res) => {
  const { transaksiId, beratDaging, beratJeroan, beratTulang } = req.body;
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { rph: true },
    });

    if (!profile || !profile.rph) {
      return res.status(403).json({ error: "Hanya RPH yang dapat memproses penyembelihan" });
    }

    const rphId = profile.rph.id;

    // Validasi transaksi
    const transaksi = await prisma.transaksiPenyembelihan.findUnique({
      where: { id: transaksiId },
      include: {
        sapi: {
          include: {
            jagal: true,
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi penyembelihan tidak ditemukan" });
    }

    if (transaksi.rphId !== rphId) {
      return res.status(403).json({ error: "Transaksi ini bukan untuk RPH Anda" });
    }

    if (transaksi.status !== "PENDING") {
      return res.status(400).json({ error: "Transaksi sudah diproses sebelumnya" });
    }

    // Validasi berat
    const totalBerat = beratDaging + beratJeroan + beratTulang;

    if (transaksi.sapi.beratSapi && totalBerat > transaksi.sapi.beratSapi) {
      return res.status(400).json({
        error: `Total berat hasil penyembelihan (${totalBerat} kg) melebihi berat sapi (${transaksi.sapi.beratSapi} kg)`,
      });
    }

    // Generate kode verifikasi halal
    const kodeVerifikasiHalal = generateKodeVerifikasiHalal();

    const result = await prisma.$transaction(async (prisma) => {
      // Update transaksi penyembelihan
      const updatedTransaksi = await prisma.transaksiPenyembelihan.update({
        where: { id: transaksiId },
        data: {
          status: "PROCESSED",
          tanggalPemrosesan: new Date(),
          beratDaging,
          beratJeroan,
          beratTulang,
          totalBerat,
        },
      });

      // Buat entitas daging untuk Jagal
      const daging = await prisma.daging.create({
        data: {
          sapiId: transaksi.sapiId,
          jagalId: transaksi.jagalId, // Owner adalah jagal
          rphId: rphId, // RPH yang melakukan penyembelihan
          beratDaging,
          beratJeroan,
          beratTulang,
          totalBerat,
          transaksiPenyembelihanId: transaksiId,
          statusHalal: "PENDING", // Pending verifikasi regulator
          kodeVerifikasiHalal,
        },
      });

      // Update counter jagal
      await prisma.jagal.update({
        where: { id: transaksi.jagalId },
        data: {
          jumlahSapi: { decrement: 1 },
          jumlahDaging: { increment: 1 },
        },
      });

      // Upload data ke IPFS
      const ipfsData = {
        action: "PEMROSESAN_PENYEMBELIHAN",
        transaksiId,
        rphId,
        jagalId: transaksi.jagalId,
        sapiId: transaksi.sapiId,
        beratDaging,
        beratJeroan,
        beratTulang,
        totalBerat,
        kodeVerifikasiHalal,
        timestamp: new Date().toISOString(),
      };

      const cid = await uploadToIPFS(JSON.stringify(ipfsData));

      // Update CID transaksi
      await prisma.transaksiPenyembelihan.update({
        where: { id: transaksiId },
        data: { cid },
      });

      return { updatedTransaksi, daging, cid };
    });

    res.status(200).json({
      message: "Penyembelihan berhasil diproses dan entitas daging telah dibuat untuk Jagal",
      transaksi: result.updatedTransaksi,
      daging: result.daging,
      ipfsCid: result.cid,
    });
  } catch (error) {
    console.error("Error memproses penyembelihan:", error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Regulator verifikasi halal daging
exports.regulatorVerifikasiHalal = async (req, res) => {
  const { dagingId, statusVerifikasi } = req.body; // statusVerifikasi: 'VERIFIED' atau 'REJECTED'
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { regulator: true },
    });

    if (!profile || !profile.regulator) {
      return res.status(403).json({ error: "Hanya Regulator yang dapat melakukan verifikasi halal" });
    }

    // Validasi daging
    const daging = await prisma.daging.findUnique({
      where: { id: dagingId },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
      },
    });

    if (!daging) {
      return res.status(404).json({ error: "Daging tidak ditemukan" });
    }

    if (!["VERIFIED", "REJECTED"].includes(statusVerifikasi)) {
      return res.status(400).json({ error: "Status verifikasi harus VERIFIED atau REJECTED" });
    }

    // Update status halal daging
    const updatedDaging = await prisma.daging.update({
      where: { id: dagingId },
      data: {
        statusHalal: statusVerifikasi,
      },
    });

    // Upload ke IPFS
    const ipfsData = {
      action: "VERIFIKASI_HALAL_DAGING",
      dagingId,
      regulatorId: profile.regulator.id,
      statusVerifikasi,
      kodeVerifikasiHalal: daging.kodeVerifikasiHalal,
      timestamp: new Date().toISOString(),
    };

    const cid = await uploadToIPFS(JSON.stringify(ipfsData));

    res.status(200).json({
      message: `Status halal daging berhasil diverifikasi sebagai ${statusVerifikasi}`,
      daging: updatedDaging,
      ipfsCid: cid,
    });
  } catch (error) {
    console.error("Error verifikasi halal daging:", error);
    res.status(500).json({ error: error.message });
  }
};

// 7. Get riwayat transaksi penyembelihan
exports.getRiwayatTransaksiPenyembelihan = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { jagal: true, rph: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile tidak ditemukan" });
    }

    let riwayat = [];

    if (profile.jagal) {
      // Jika user adalah Jagal, tampilkan transaksi yang dia daftarkan
      riwayat = await prisma.transaksiPenyembelihan.findMany({
        where: { jagalId: profile.jagal.id },
        include: {
          sapi: true,
          rph: true,
          daging: true,
        },
        orderBy: { timestamp: "desc" },
      });
    } else if (profile.rph) {
      // Jika user adalah RPH, tampilkan transaksi yang diproses oleh RPH
      riwayat = await prisma.transaksiPenyembelihan.findMany({
        where: { rphId: profile.rph.id },
        include: {
          sapi: true,
          jagal: true,
          daging: true,
        },
        orderBy: { timestamp: "desc" },
      });
    }

    res.status(200).json({
      message: "Riwayat transaksi penyembelihan",
      data: riwayat,
    });
  } catch (error) {
    console.error("Error mengambil riwayat transaksi:", error);
    res.status(500).json({ error: error.message });
  }
};

// 8. Get statistik penyembelihan
exports.getStatistikPenyembelihan = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { jagal: true, rph: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile tidak ditemukan" });
    }

    let statistik = {};

    if (profile.jagal) {
      // Statistik untuk Jagal
      const [totalPendaftaran, totalSelesai, totalDaging] = await Promise.all([
        prisma.transaksiPenyembelihan.count({
          where: { jagalId: profile.jagal.id },
        }),
        prisma.transaksiPenyembelihan.count({
          where: {
            jagalId: profile.jagal.id,
            status: "PROCESSED",
          },
        }),
        prisma.daging.count({
          where: { jagalId: profile.jagal.id },
        }),
      ]);

      statistik = {
        totalPendaftaran,
        totalSelesai,
        totalDaging,
        totalPending: totalPendaftaran - totalSelesai,
      };
    } else if (profile.rph) {
      // Statistik untuk RPH
      const [totalDiterima, totalDiproses, totalPending] = await Promise.all([
        prisma.transaksiPenyembelihan.count({
          where: { rphId: profile.rph.id },
        }),
        prisma.transaksiPenyembelihan.count({
          where: {
            rphId: profile.rph.id,
            status: "PROCESSED",
          },
        }),
        prisma.transaksiPenyembelihan.count({
          where: {
            rphId: profile.rph.id,
            status: "PENDING",
          },
        }),
      ]);

      statistik = {
        totalDiterima,
        totalDiproses,
        totalPending,
      };
    }

    res.status(200).json({
      message: "Statistik penyembelihan",
      data: statistik,
    });
  } catch (error) {
    console.error("Error mengambil statistik:", error);
    res.status(500).json({ error: error.message });
  }
};

// 9. Get daging yang perlu verifikasi halal (untuk Regulator)
exports.getDagingPendingVerifikasi = async (req, res) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: { regulator: true },
    });

    if (!profile || !profile.regulator) {
      return res.status(403).json({ error: "Hanya Regulator yang dapat mengakses endpoint ini" });
    }

    const dagingPending = await prisma.daging.findMany({
      where: {
        statusHalal: "PENDING",
      },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        transaksiPenyembelihan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Daftar daging yang perlu verifikasi halal",
      data: dagingPending,
    });
  } catch (error) {
    console.error("Error mengambil daging pending verifikasi:", error);
    res.status(500).json({ error: error.message });
  }
};

// Functions for backward compatibility or general queries
exports.getAllTransaksiPenyembelihan = async (req, res) => {
  try {
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findMany({
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });
    res.status(200).json(transaksiPenyembelihan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiPenyembelihanById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaksiPenyembelihan = await prisma.transaksiPenyembelihan.findUnique({
      where: { id },
      include: {
        sapi: true,
        jagal: true,
        rph: true,
        daging: true,
      },
    });

    if (transaksiPenyembelihan) {
      res.status(200).json(transaksiPenyembelihan);
    } else {
      res.status(404).json({ error: "Transaksi Penyembelihan not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Backward compatibility functions - keep old endpoints working
exports.updateTransaksiPenyembelihan = async (req, res) => {
  res.status(405).json({ error: "Update transaksi penyembelihan tidak diizinkan. Gunakan endpoint proses penyembelihan yang sesuai." });
};

exports.deleteTransaksiPenyembelihan = async (req, res) => {
  res.status(405).json({ error: "Delete transaksi penyembelihan tidak diizinkan." });
};

// Compatibility for old createTransaksiPenyembelihan
exports.createTransaksiPenyembelihan = async (req, res) => {
  res.status(405).json({
    error: "Endpoint lama tidak digunakan. Gunakan /jagal/daftarkan untuk mendaftarkan sapi atau /rph/proses-penyembelihan untuk memproses penyembelihan.",
  });
};
