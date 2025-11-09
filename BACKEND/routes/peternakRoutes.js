const express = require('express');
const router = express.Router();
const peternakController = require('../controllers/peternakController');

router.get('/', peternakController.getAllPeternak);
router.get('/user/:userId', peternakController.getPeternakByUserId);
router.get('/:id', peternakController.getPeternakById);
router.post('/', peternakController.createPeternak);
router.put('/:id', peternakController.updatePeternak);
router.put('/user/:userId', peternakController.updatePeternakByUserId);
router.delete('/:id', peternakController.deletePeternak);

module.exports = router;