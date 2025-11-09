const express = require('express');
const router = express.Router();
const pengecekanSehatController = require('../controllers/pengecekanSehatController');

router.get('/', pengecekanSehatController.getAllPengecekanSehat);
router.get('/:id', pengecekanSehatController.getPengecekanSehatById);
router.post('/', pengecekanSehatController.createPengecekanSehat);
router.put('/:id', pengecekanSehatController.updatePengecekanSehat);
router.delete('/:id', pengecekanSehatController.deletePengecekanSehat);

module.exports = router;