const express = require("express");
const router = express.Router();
const transaksiPenjualanController = require("../controllers/transaksiPenjualanController");

// Main routes
router.get("/", transaksiPenjualanController.getAllTransaksiPenjualan);  // Menampilkan semua transaksi penjualan

// Statistik transaksi
router.get("/testing/stats", transaksiPenjualanController.getTransaksiStats); // Endpoint statistik transaksi

// Filter transaksi berdasarkan penjual (daging/sapi)
router.get("/testing/seller/:penjualType", transaksiPenjualanController.getTransaksiByPenjualType); // Filter berdasarkan jenis penjual
router.get("/testing/buyer/:pembeliType", transaksiPenjualanController.getTransaksiByPembeliType); // Filter berdasarkan jenis pembeli

// Debug endpoints
router.get("/debug/jagal-ids", transaksiPenjualanController.debugJagalIds); // Endpoint debug untuk mendapatkan ID Jagal

// Specific entity transaction endpoints
router.get("/jagal/:jagalId/transactions", transaksiPenjualanController.getJagalTransactions); // Get all transactions for specific Jagal
router.get("/distributor/:distributorId/transactions", transaksiPenjualanController.getDistributorTransactions); // Get all transactions for specific Distributor
router.get("/horeka/:horekaId/transactions", transaksiPenjualanController.getHorekaTransactions); // Get all transactions for specific Horeka

// Menampilkan transaksi berdasarkan ID
router.get("/:id", transaksiPenjualanController.getTransaksiPenjualanById); // Menampilkan transaksi berdasarkan ID

// Menampilkan transaksi masuk dan keluar berdasarkan tipe entitas dan ID entitas
router.get("/incoming/:entityType/:entityId", transaksiPenjualanController.getIncomingTransaksi); // Transaksi masuk untuk entitas
router.get("/outgoing/:entityType/:entityId", transaksiPenjualanController.getOutgoingTransaksi); // Transaksi keluar untuk entitas

// Operasi transaksi penjualan
router.post("/", transaksiPenjualanController.createTransaksiPenjualan);  // Membuat transaksi penjualan baru
router.post("/transfer", transaksiPenjualanController.transferSapi); // Transfer sapi dari Pasar Hewan ke Jagal
router.post("/:id/verify", transaksiPenjualanController.verifyTransaction); // Verifikasi transaksi oleh penjual atau pembeli (OTP)
router.put("/:id/verify", transaksiPenjualanController.verifyTransaction); // Verifikasi transaksi dengan PUT method
router.post("/:id/requestVerification", transaksiPenjualanController.requestVerification); // Permintaan kode verifikasi untuk transaksi
router.put("/:id/reject", transaksiPenjualanController.rejectVerification); // Pembatalan verifikasi transaksi
router.post("/:id/rejectVerification", transaksiPenjualanController.rejectVerification); // Membatalkan verifikasi transaksi
router.put("/:id/cancel", transaksiPenjualanController.cancelTransaksi); // Pembatalan transaksi
router.delete("/:id", transaksiPenjualanController.deleteTransaksiPenjualan); // Menghapus transaksi penjualan

module.exports = router;
