const express = require('express');
const router = express.Router();
const sapiController = require('../controllers/sapiController');

router.get('/', sapiController.getAllSapi);
router.get('/:id', sapiController.getSapiById);
router.post('/', sapiController.createSapi);
router.put('/:id', sapiController.updateSapi);
router.delete('/:id', sapiController.deleteSapi);

module.exports = router;