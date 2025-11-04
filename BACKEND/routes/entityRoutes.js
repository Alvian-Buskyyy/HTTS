const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

// Get all entities (for landing page)
router.get('/', entityController.getAllRegisteredEntities);
router.get('/registered', entityController.getAllRegisteredEntities);

// Get specific entity
router.get('/:entityType/:entityId', entityController.getEntityById);

// Validate entity
router.post('/validate', entityController.validateEntity);

module.exports = router;
