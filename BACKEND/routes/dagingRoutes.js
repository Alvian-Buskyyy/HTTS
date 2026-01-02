const express = require('express');
const router = express.Router();
const dagingController = require('../controllers/dagingController');

router.get('/', dagingController.getAllDaging);
router.get('/jagal/:jagalId', dagingController.getDagingByJagalId);
router.get('/distributor/:distributorId', dagingController.getDagingByDistributorId);
router.get('/:id', dagingController.getDagingById);
router.post('/', dagingController.createDaging);
router.put('/:id', dagingController.updateDaging);
router.delete('/:id', dagingController.deleteDaging);

module.exports = router;