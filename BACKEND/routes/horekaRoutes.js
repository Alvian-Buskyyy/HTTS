const express = require('express');
const router = express.Router();
const horekaController = require('../controllers/horekaController');

router.get('/', horekaController.getAllHoreka);
router.get('/:id', horekaController.getHorekaById);
router.post('/', horekaController.createHoreka);
router.put('/:id', horekaController.updateHoreka);
router.delete('/:id', horekaController.deleteHoreka);

module.exports = router;