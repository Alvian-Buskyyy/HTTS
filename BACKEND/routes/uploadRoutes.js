const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Upload profile photo
router.post('/profile-photo', uploadController.uploadMiddleware, uploadController.uploadProfilePhoto);

// Delete profile photo
router.delete('/profile-photo/:userId', uploadController.deleteProfilePhoto);

module.exports = router;
