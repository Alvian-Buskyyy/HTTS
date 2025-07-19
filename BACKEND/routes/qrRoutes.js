const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.get('/', qrController.getAllQRs);
router.get('/:id', qrController.getQRById);
router.post('/', qrController.createQR);
router.put('/:id', qrController.updateQR);
router.delete('/:id', qrController.deleteQR);

module.exports = router;