const express = require('express');
const router = express.Router();
const transaksiPenjualanController = require('../controllers/transaksiPenjualanController');

router.get('/', transaksiPenjualanController.getAllTransaksiPenjualan);
router.get('/:id', transaksiPenjualanController.getTransaksiPenjualanById);
router.post('/', transaksiPenjualanController.createTransaksiPenjualan);
// router.put('/:id', transaksiPenjualanController.updateTransaksiPenjualan);
router.delete('/:id', transaksiPenjualanController.deleteTransaksiPenjualan);

module.exports = router;