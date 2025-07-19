const express = require('express');
const router = express.Router();
const endCustomerController = require('../controllers/endCustomerController');

router.get('/', endCustomerController.getAllEndCustomers);
router.get('/:id', endCustomerController.getEndCustomerById);
router.post('/', endCustomerController.createEndCustomer);
router.put('/:id', endCustomerController.updateEndCustomer);
router.delete('/:id', endCustomerController.deleteEndCustomer);

module.exports = router;