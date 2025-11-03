const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/profile', userController.getUserProfile);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:userId/profile-photo', userController.updateProfilePhoto);
router.delete('/:id', userController.deleteUser);

module.exports = router;