const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Untuk menangani preflight request OPTIONS pada semua rute auth
router.options('*', (req, res) => {
  res.sendStatus(204);
});

// Rute untuk pendaftaran user baru
router.post('/signup', authController.signup);

// Rute untuk login user
router.post('/signin', authController.signin);

// Rute untuk validasi token
router.post('/validate', authController.verifyToken, (req, res) => {
  res.json({ 
    valid: true,
    user: req.user
  });
});

// Rute contoh untuk mengecek autentikasi
router.get('/protected', authController.verifyToken, (req, res) => {
  res.json({ message: 'Ini adalah rute terproteksi', user: req.user });
});

// Contoh rute dengan cek role
router.get('/admin', 
  authController.verifyToken,
  authController.checkRole(['ADMIN']), 
  (req, res) => {
    res.json({ message: 'Anda memiliki akses admin' });
  }
);

module.exports = router;
