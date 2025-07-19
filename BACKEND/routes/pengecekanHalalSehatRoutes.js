const express = require('express');
const router = express.Router();
const pengecekanHalalSehatController = require('../controllers/pengecekanHalalSehatController');

router.get('/', pengecekanHalalSehatController.getAllPengecekanHalalSehat);
router.get('/:id', pengecekanHalalSehatController.getPengecekanHalalSehatById);
router.post('/', pengecekanHalalSehatController.createPengecekanHalalSehat);
router.put('/:id', pengecekanHalalSehatController.updatePengecekanHalalSehat);
router.delete('/:id', pengecekanHalalSehatController.deletePengecekanHalalSehat);

module.exports = router;