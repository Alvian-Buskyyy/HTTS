const express = require('express');
const router = express.Router();
const regulatorController = require('../controllers/RegulatorController');

router.get('/', regulatorController.getAllRegulators);
router.get('/:id', regulatorController.getRegulatorById);
router.post('/', regulatorController.createRegulator);
router.put('/:id', regulatorController.updateRegulator);
router.delete('/:id', regulatorController.deleteRegulator);

module.exports = router;