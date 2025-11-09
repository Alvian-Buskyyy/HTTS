const express = require('express');
const router = express.Router();
const pasarHewanController = require('../controllers/pasarHewanController');

router.get('/', pasarHewanController.getAllPasarHewan);
router.get('/user/:userId', pasarHewanController.getPasarHewanByUserId);
router.get('/:id', pasarHewanController.getPasarHewanById);
router.post('/', pasarHewanController.createPasarHewan);
// Pastikan route user-based didefinisikan sebelum route by-id untuk mencegah konflik pola
router.put('/user/:userId', pasarHewanController.updatePasarHewanByUserId);
router.put('/:id', pasarHewanController.updatePasarHewan);
router.delete('/:id', pasarHewanController.deletePasarHewan);

module.exports = router;