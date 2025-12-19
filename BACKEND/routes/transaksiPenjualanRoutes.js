const express = require("express");
const router = express.Router();
const transaksiPenjualanController = require("../controllers/transaksiPenjualanController");

// Main routes
router.get("/", transaksiPenjualanController.getAllTransaksiPenjualan);

// Testing endpoints for Postman
router.get("/testing/stats", transaksiPenjualanController.getTransaksiStats); // Statistics endpoint
router.get("/testing/seller/:penjualType", transaksiPenjualanController.getTransaksiByPenjualType); // Filter by seller type
router.get("/testing/buyer/:pembeliType", transaksiPenjualanController.getTransaksiByPembeliType); // Filter by buyer type

// Debug endpoints
router.get("/debug/jagal-ids", transaksiPenjualanController.debugJagalIds); // Debug endpoint

// Specific transaction by ID (must come after other GET routes to avoid conflicts)
router.get("/:id", transaksiPenjualanController.getTransaksiPenjualanById);

// Incoming and outgoing transactions
router.get("/incoming/:entityType/:entityId", transaksiPenjualanController.getIncomingTransaksi);
router.get("/outgoing/:entityType/:entityId", transaksiPenjualanController.getOutgoingTransaksi);

// Transaction operations
router.post("/", transaksiPenjualanController.createTransaksiPenjualan);
router.post("/transfer", transaksiPenjualanController.transferSapi); // New transfer endpoint for Pasar Hewan to Jagal
router.post("/:id/verify", transaksiPenjualanController.verifyTransaction); // New flexible verify endpoint
router.put("/:id/verify", transaksiPenjualanController.verifyTransaction); // PUT method for verify
router.post("/:id/requestVerification", transaksiPenjualanController.requestVerification);
router.post("/:id/confirmBuyer", transaksiPenjualanController.confirmBuyer);
router.put("/:id/reject", transaksiPenjualanController.rejectVerification); // PUT method for reject
router.post("/:id/rejectVerification", transaksiPenjualanController.rejectVerification);
router.put("/:id/cancel", transaksiPenjualanController.cancelTransaksi); // New cancel endpoint
// router.put('/:id', transaksiPenjualanController.updateTransaksiPenjualan);
router.delete("/:id", transaksiPenjualanController.deleteTransaksiPenjualan);

module.exports = router;
