const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authenticateToken } = require('../utils/authMiddleware');

// QR Tracking routes
router.get('/sapi/:sapiId/track', authenticateToken, qrController.trackSapi);
router.get('/daging/:dagingId/track', authenticateToken, qrController.trackDaging);

// Legacy routes (keep for backward compatibility)
router.get('/', qrController.getAllQRs);
router.get('/:id', qrController.getQRById);
router.post('/generate', qrController.generateQR);
router.post('/', qrController.createQR);
router.put('/:id', qrController.updateQR);
router.delete('/:id', qrController.deleteQR);

module.exports = router;