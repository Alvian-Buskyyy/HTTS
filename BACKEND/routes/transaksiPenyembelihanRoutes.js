const express = require('express');
const router = express.Router();
const transaksiPenyembelihanController = require('../controllers/transaksiPenyembelihanController');

router.get('/', transaksiPenyembelihanController.getAllTransaksiPenyembelihan);
router.get('/:id', transaksiPenyembelihanController.getTransaksiPenyembelihanById);
router.post('/', transaksiPenyembelihanController.createTransaksiPenyembelihan);
router.put('/:id', transaksiPenyembelihanController.updateTransaksiPenyembelihan);
router.delete('/:id', transaksiPenyembelihanController.deleteTransaksiPenyembelihan);
router.post('/convert-sapi-to-daging', transaksiPenyembelihanController.convertSapiToDaging);

module.exports = router;