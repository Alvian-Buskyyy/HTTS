const express = require('express');
const router = express.Router();
const itemHalalSehatController = require('../controllers/ItemHalalSehatController');

router.get('/', itemHalalSehatController.getAllItemHalalSehat);
router.get('/:id', itemHalalSehatController.getItemHalalSehatById);
router.post('/', itemHalalSehatController.createItemHalalSehat);
router.put('/:id', itemHalalSehatController.updateItemHalalSehat);
router.delete('/:id', itemHalalSehatController.deleteItemHalalSehat);

module.exports = router;