const express = require("express");
const router = express.Router();
const transaksiPenyembelihanController = require("../controllers/transaksiPenyembelihanController");
const { authenticateToken, requireJagal, requireRPH, requireRegulator, requireAdminOr } = require("../utils/authMiddleware");

// Routes untuk semua user (admin/monitoring)
router.get("/", authenticateToken, requireAdminOr(["JAGAL", "RPH", "REGULATOR"]), transaksiPenyembelihanController.getAllTransaksiPenyembelihan);
router.get("/detail/:id", authenticateToken, transaksiPenyembelihanController.getTransaksiPenyembelihanById);

// Routes khusus untuk Jagal
router.get("/jagal/sapi", authenticateToken, requireJagal, transaksiPenyembelihanController.getSapiJagal); // Jagal melihat sapi miliknya
router.get("/jagal/rph", authenticateToken, requireJagal, transaksiPenyembelihanController.getDaftarRPH); // Jagal melihat daftar RPH
router.post("/jagal/daftarkan", authenticateToken, requireJagal, transaksiPenyembelihanController.jagalDaftarkanSapi); // Jagal daftarkan sapi ke RPH

// Routes khusus untuk RPH
router.get("/rph/sapi-pending", authenticateToken, requireRPH, transaksiPenyembelihanController.getSapiPendingRPH); // RPH melihat sapi yang didaftarkan ke RPH nya
router.post("/rph/proses-penyembelihan", authenticateToken, requireRPH, transaksiPenyembelihanController.rphProsesPenyembelihan); // RPH proses penyembelihan

// Routes khusus untuk Regulator
router.get("/regulator/daging-pending", authenticateToken, requireRegulator, transaksiPenyembelihanController.getDagingPendingVerifikasi); // Regulator melihat daging pending verifikasi
router.post("/regulator/verifikasi-halal", authenticateToken, requireRegulator, transaksiPenyembelihanController.regulatorVerifikasiHalal); // Regulator verifikasi halal daging

// Routes untuk riwayat dan statistik (Jagal/RPH)
router.get("/riwayat", authenticateToken, requireAdminOr(["JAGAL", "RPH"]), transaksiPenyembelihanController.getRiwayatTransaksiPenyembelihan);
router.get("/statistik", authenticateToken, requireAdminOr(["JAGAL", "RPH"]), transaksiPenyembelihanController.getStatistikPenyembelihan);

module.exports = router;
