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
router.get("/jagal/daging", authenticateToken, requireJagal, transaksiPenyembelihanController.getAllDagingJagal); // Jagal melihat semua daging miliknya
router.get("/jagal/daging/:id", authenticateToken, requireJagal, transaksiPenyembelihanController.getDagingDetailJagal); // Jagal melihat detail daging
router.get("/jagal/daging-pending", authenticateToken, requireJagal, transaksiPenyembelihanController.getDagingPendingVerifikasiJagal); // Jagal melihat daging pending verifikasi
router.post("/jagal/daftarkan", authenticateToken, requireJagal, transaksiPenyembelihanController.jagalDaftarkanSapi); // Jagal daftarkan sapi ke RPH
router.post("/jagal/request-verification-code", authenticateToken, requireJagal, transaksiPenyembelihanController.jagalRequestVerificationCode); // Jagal request kode verifikasi
router.post("/jagal/verifikasi-hasil", authenticateToken, requireJagal, transaksiPenyembelihanController.jagalVerifikasiHasil); // Jagal verifikasi hasil penyembelihan

// Routes khusus untuk RPH
router.get("/rph/sapi-pending", authenticateToken, requireRPH, transaksiPenyembelihanController.getSapiPendingRPH); // RPH melihat sapi yang didaftarkan ke RPH nya
router.post("/rph/proses-penyembelihan", authenticateToken, requireRPH, transaksiPenyembelihanController.rphProsesPenyembelihan); // RPH proses penyembelihan

// Routes khusus untuk Regulator
router.get("/regulator/daging-pending", authenticateToken, requireRegulator, transaksiPenyembelihanController.getDagingPendingRegulator); // Regulator melihat daging pending verifikasi
router.post("/regulator/request-verification-code", authenticateToken, requireRegulator, transaksiPenyembelihanController.regulatorRequestVerificationCode); // Regulator request kode verifikasi
router.post("/regulator/verifikasi-halal", authenticateToken, requireRegulator, transaksiPenyembelihanController.regulatorVerifikasiHasil); // Regulator verifikasi halal daging

// Routes untuk riwayat dan statistik (Jagal/RPH)
router.get("/riwayat", authenticateToken, requireAdminOr(["JAGAL", "RPH"]), transaksiPenyembelihanController.getRiwayatTransaksiPenyembelihan);
router.get("/statistik", authenticateToken, requireAdminOr(["JAGAL", "RPH"]), transaksiPenyembelihanController.getStatistikPenyembelihan);

// Regulator: Kelola checklist halal
router.get("/checklist-halal", authenticateToken, transaksiPenyembelihanController.getAllChecklistHalal);
router.post("/checklist-halal", authenticateToken, requireRegulator, transaksiPenyembelihanController.createChecklistHalal);
router.put("/checklist-halal/:id", authenticateToken, requireRegulator, transaksiPenyembelihanController.updateChecklistHalal);
router.delete("/checklist-halal/:id", authenticateToken, requireRegulator, transaksiPenyembelihanController.deleteChecklistHalal);

// RPH: Proses checklist dan penyembelihan
router.get("/detail-checklist/:id", authenticateToken, requireRPH, transaksiPenyembelihanController.getTransaksiWithChecklist);
router.post("/rph/mulai-checklist-pra", authenticateToken, requireRPH, transaksiPenyembelihanController.rphMulaiChecklistPra);
router.post("/rph/update-checklist", authenticateToken, requireRPH, transaksiPenyembelihanController.rphUpdateChecklist);
router.post("/rph/submit-checklist-pra", authenticateToken, requireRPH, transaksiPenyembelihanController.rphSubmitChecklistPra);
router.post("/rph/mulai-penyembelihan", authenticateToken, requireRPH, transaksiPenyembelihanController.rphMulaiPenyembelihan);
router.post("/rph/mulai-checklist-pasca", authenticateToken, requireRPH, transaksiPenyembelihanController.rphMulaiChecklistPasca);
router.post("/rph/submit-checklist-pasca", authenticateToken, requireRPH, transaksiPenyembelihanController.rphSubmitChecklistPasca);
router.post("/rph/input-hasil-penyembelihan", authenticateToken, requireRPH, transaksiPenyembelihanController.rphInputHasilPenyembelihan);

module.exports = router;
