const express = require('express');
const router = express.Router();
const rphController = require('../controllers/rphController');

router.get('/', rphController.getAllRPH);
router.get('/:id', rphController.getRPHById);
router.post('/', rphController.createRPH);
router.put('/:id', rphController.updateRPH);
router.delete('/:id', rphController.deleteRPH);

module.exports = router;