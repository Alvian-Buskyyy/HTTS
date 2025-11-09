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
  const { username, email, password, role, profileData } = req.body;

  // Validasi input dasar
  if (!username || !email || !password || !role) {
    return res.status(400).json({ 
      message: 'Username, email, password, dan role diperlukan' 
    });
  }

  // Validasi role yang valid
  const validRoles = ['PETERNAK', 'PASAR_HEWAN', 'JAGAL', 'RPH', 'DISTRIBUTOR', 'HOREKA', 'END_CUSTOMER', 'REGULATOR'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: `Role tidak valid. Role yang tersedia: ${validRoles.join(', ')}` 
    });
  }

  console.log('Signup request body:', req.body);

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

    // Buat user baru dan entity terkait dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat user baru
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
        },
      });

      // 2. Buat data di table entity sesuai role
      let entityData = null;
      
      // Prepare base entity data
      const baseEntityData = {
        nama: profileData.nama || username,
        alamat: profileData.alamat || '',
        noTelepon: profileData.noTelepon || '',
      };

      switch (role) {
        case 'PETERNAK':
          // Peternak menggunakan id user sebagai primary key (tidak auto-generated)
          const createdPeternak = await tx.peternak.create({
            data: {
              id: newUser.id, 
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              jumlahSapi: 0,
              sertifikatNKV: req.body.sertifikatNKV || null,
            },
          });
          await tx.profile.create({
            data: {
              entityType: 'PETERNAK',
              peternakId: newUser.id,
              userId: newUser.id,
            }
          });
          entityData = createdPeternak;
          break;

        case 'PASAR_HEWAN':
          // Pasar Hewan menggunakan auto-generated UUID dan userId untuk relasi
          entityData = await tx.pasarHewan.create({
            data: {
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              jumlahSapi: 0,
              sertifikatNKV: req.body.sertifikatNKV || null,
              userId: newUser.id,
            },
          });
          break;

        case 'JAGAL':
          // Normalisasi jumlahSapi & jumlahDaging dari profileData jika ada
          const initialJumlahSapi = profileData && profileData.jumlahSapi !== undefined 
            ? Math.max(0, parseInt(profileData.jumlahSapi)) 
            : 0;
          const initialJumlahDaging = profileData && profileData.jumlahDaging !== undefined 
            ? Math.max(0, parseInt(profileData.jumlahDaging)) 
            : 0;

          const createdJagal = await tx.jagal.create({
            data: {
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              jumlahSapi: initialJumlahSapi,
              jumlahDaging: initialJumlahDaging,
              sertifikatNKV: req.body.sertifikatNKV || null,
              userId: newUser.id,
            },
          });
          await tx.profile.create({
            data: {
              entityType: 'JAGAL',
              jagalId: createdJagal.id,
              userId: newUser.id,
            }
          });
          entityData = createdJagal;
          break;

        case 'RPH':
          entityData = await tx.rPH.create({
            data: {
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              sertifikatNKV: req.body.sertifikatNKV || null,
              sertifikatHalal: req.body.sertifikatHalal || null,
              namaJuleha: req.body.namaJuleha || null,
              noSertifJuleha: req.body.noSertifJuleha || null,
              jumlahPenyelia: req.body.jumlahPenyelia || 0,
              userId: newUser.id,
            },
          });
          break;

        case 'DISTRIBUTOR':
          entityData = await tx.distributor.create({
            data: {
              namaUsaha: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              kondisiProduk: req.body.kondisiProduk || null,
              fasilitasPenyimpanan: req.body.fasilitasPenyimpanan || null,
              userId: newUser.id,
            },
          });
          break;

        case 'HOREKA':
          entityData = await tx.horeka.create({
            data: {
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              kondisiProduk: req.body.kondisiProduk || null,
              userId: newUser.id,
            },
          });
          break;

        case 'END_CUSTOMER':
          entityData = await tx.endCustomer.create({
            data: {
              nama: baseEntityData.nama,
              alamat: baseEntityData.alamat,
              noTelepon: baseEntityData.noTelepon,
              userId: newUser.id,
            },
          });
          break;

        case 'REGULATOR':
          entityData = await tx.regulator.create({
            data: {
              nama: baseEntityData.nama,
              instansi: req.body.instansi || '',
              jabatan: req.body.jabatan || '',
              userId: newUser.id,
            },
          });
          break;

        default:
          throw new Error(`Role ${role} tidak memiliki entity table yang sesuai`);
      }

      return { newUser, entityData };
    });

    const { newUser, entityData } = result;

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate token untuk user baru dengan entityId
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        entityId: entityData.id // Tambahkan entityId ke token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Kirim response sukses dengan token dan entity data
    handleCorsResponse(res).status(201).json({
      message: 'User berhasil terdaftar',
      user: {
        ...userWithoutPassword,
        entityId: entityData.id,
        entityData: {
          id: entityData.id,
          nama: entityData.nama,
          alamat: entityData.alamat,
          noTelepon: entityData.noTelepon,
        }
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mendaftarkan user', 
      error: error.message 
    });
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

    // Cari entity data berdasarkan role
    let entityData = null;
    try {
      switch (user.role) {
        case 'PETERNAK':
          entityData = await prisma.peternak.findFirst({
            where: { id: user.id }
          });
          break;
        case 'PASAR_HEWAN':
          entityData = await prisma.pasarHewan.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'JAGAL':
          entityData = await prisma.jagal.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'RPH':
          entityData = await prisma.rPH.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'DISTRIBUTOR':
          entityData = await prisma.distributor.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'HOREKA':
          entityData = await prisma.horeka.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'END_CUSTOMER':
          entityData = await prisma.endCustomer.findFirst({
            where: { userId: user.id }
          });
          break;
        case 'REGULATOR':
          entityData = await prisma.regulator.findFirst({
            where: { userId: user.id }
          });
          break;
      }
    } catch (entityError) {
      console.warn(`Warning: Could not fetch entity data for role ${user.role}:`, entityError.message);
    }

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    // Generate token untuk user dengan entityId jika ada
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    if (entityData) {
      tokenPayload.entityId = entityData.id;
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Kirim response sukses dengan token dan entity data
    const responseData = {
      message: 'Login berhasil',
      user: userWithoutPassword,
      token
    };

    if (entityData) {
      responseData.user.entityId = entityData.id;
      responseData.user.entityData = {
        id: entityData.id,
        nama: entityData.nama,
        alamat: entityData.alamat,
        noTelepon: entityData.noTelepon,
      };
    }

    handleCorsResponse(res).status(200).json(responseData);
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
