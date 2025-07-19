const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Gunakan variabel lingkungan di produksi
const SALT_ROUNDS = 10;

// Helper untuk menangani respons CORS yang lebih spesifik untuk auth
const handleCorsResponse = (res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  return res;
};

/**
 * Controller untuk mendaftarkan user baru (signup)
 */
exports.signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validasi input dasar
  if (!username || !email || !password || !role) {
    return res.status(400).json({ 
      message: 'Username, email, password, dan role diperlukan' 
    });
  }

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate token untuk user baru
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Kirim response sukses dengan token
    handleCorsResponse(res).status(201).json({
      message: 'User berhasil terdaftar',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mendaftarkan user', error: error.message });
  }
};

/**
 * Controller untuk login user yang sudah terdaftar (signin)
 */
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input dasar
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password diperlukan' });
  }

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: 'Email tidak terdaftar' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    // Generate token untuk user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Kirim response sukses dengan token
    handleCorsResponse(res).status(200).json({
      message: 'Login berhasil',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login', error: error.message });
  }
};

/**
 * Middleware untuk verifikasi token JWT
 */
exports.verifyToken = (req, res, next) => {
  // Token bisa berasal dari beberapa sumber:
  // 1. Header Authorization (Format: "Bearer TOKEN")
  // 2. Query parameter (?token=TOKEN)
  // 3. Body request
  // 4. Cookie

  let token = null;
  
  // Cek header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // Cek query parameter
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  // Cek body request
  if (!token && req.body.token) {
    token = req.body.token;
  }
  
  // Cek cookie (jika menggunakan cookie-parser middleware)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Jika tidak ada token di semua sumber
  if (!token) {
    return res.status(401).json({ message: 'Token tidak disediakan' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Simpan data user dari token ke request
    next(); // Lanjut ke handler berikutnya
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
};

/**
 * Middleware untuk memeriksa role user
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak, tidak terautentikasi' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Akses ditolak, tidak memiliki hak akses yang cukup' 
      });
    }
    
    next();
  };
};
