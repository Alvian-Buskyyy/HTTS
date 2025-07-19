const express = require('express');
const router = express.Router();
const itemSehatController = require('../controllers/itemSehatController');

router.get('/', itemSehatController.getAllItemSehat);
router.get('/:id', itemSehatController.getItemSehatById);
router.post('/', itemSehatController.createItemSehat);
router.put('/:id', itemSehatController.updateItemSehat);
router.delete('/:id', itemSehatController.deleteItemSehat);

module.exports = router;