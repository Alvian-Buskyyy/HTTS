const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get profile by userId
router.get('/:userId', profileController.getProfileByUserId);

// Update profile
router.put('/:userId', profileController.updateProfile);

module.exports = router;
