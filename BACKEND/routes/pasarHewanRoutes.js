const express = require('express');
const router = express.Router();
const pasarHewanController = require('../controllers/pasarHewanController');

router.get('/', pasarHewanController.getAllPasarHewan);
router.get('/:id', pasarHewanController.getPasarHewanById);
router.post('/', pasarHewanController.createPasarHewan);
router.put('/:id', pasarHewanController.updatePasarHewan);
router.delete('/:id', pasarHewanController.deletePasarHewan);

module.exports = router;