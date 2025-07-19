const express = require('express');
const router = express.Router();
const jagalController = require('../controllers/jagalController');

router.get('/', jagalController.getAllJagal);
router.get('/:id', jagalController.getJagalById);
router.post('/', jagalController.createJagal);
router.put('/:id', jagalController.updateJagal);
router.delete('/:id', jagalController.deleteJagal);

module.exports = router;