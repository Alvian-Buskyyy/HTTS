const express = require('express');
const router = express.Router();
const peternakController = require('../controllers/peternakController');

router.get('/', peternakController.getAllPeternak);
router.get('/:id', peternakController.getPeternakById);
router.post('/', peternakController.createPeternak);
router.put('/:id', peternakController.updatePeternak);
router.delete('/:id', peternakController.deletePeternak);

module.exports = router;