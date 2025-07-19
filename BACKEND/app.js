const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const prisma = require('./prisma/client');

// Middleware
app.use(bodyParser.json());

// Konfigurasi CORS
const corsOptions = {
  origin: '*', // Pada environment produksi, ubah ini ke domain spesifik Anda
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Terapkan middleware CORS
app.use(cors(corsOptions));

// Routes
const peternakRoutes = require('./routes/peternakRoutes');
const pasarHewanRoutes = require('./routes/pasarHewanRoutes');
const jagalRoutes = require('./routes/jagalRoutes');
const rphRoutes = require('./routes/rphRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const horekaRoutes = require('./routes/horekaRoutes');
const endCustomerRoutes = require('./routes/endCustomerRoutes');
const sapiRoutes = require('./routes/sapiRoutes');
const dagingRoutes = require('./routes/dagingRoutes');
const transaksiPenyembelihanRoutes = require('./routes/transaksiPenyembelihanRoutes');
const transaksiPenjualanRoutes = require('./routes/transaksiPenjualanRoutes');
const pengecekanSehatRoutes = require('./routes/pengecekanSehatRoutes');
const pengecekanHalalSehatRoutes = require('./routes/pengecekanHalalSehatRoutes');
const qrRoutes = require('./routes/qrRoutes');
const itemSehatRoutes = require('./routes/itemSehatRoutes');
const itemHalalSehatRoutes = require('./routes/itemHalalSehatRoutes');
const regulatorRoutes = require('./routes/regulatorRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/peternak', peternakRoutes);
app.use('/pasarHewan', pasarHewanRoutes);
app.use('/jagal', jagalRoutes);
app.use('/rph', rphRoutes);
app.use('/distributor', distributorRoutes);
app.use('/horeka', horekaRoutes);
app.use('/endCustomer', endCustomerRoutes);
app.use('/sapi', sapiRoutes);
app.use('/daging', dagingRoutes);
app.use('/transaksiPenyembelihan', transaksiPenyembelihanRoutes);
app.use('/transaksiPenjualan', transaksiPenjualanRoutes);
app.use('/pengecekanSehat', pengecekanSehatRoutes);
app.use('/pengecekanHalalSehat', pengecekanHalalSehatRoutes);
app.use('/qr', qrRoutes);
app.use('/itemSehat', itemSehatRoutes);
app.use('/itemHalalSehat', itemHalalSehatRoutes);
app.use('/regulator', regulatorRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;