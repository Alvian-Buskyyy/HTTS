const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');

router.get('/', distributorController.getAllDistributors);
router.get('/user/:userId', distributorController.getDistributorByUserId);
router.get('/:id', distributorController.getDistributorById);
router.post('/', distributorController.createDistributor);
router.put('/:id', distributorController.updateDistributor);
router.put('/user/:userId', distributorController.updateDistributorByUserId);
router.delete('/:id', distributorController.deleteDistributor);

module.exports = router;