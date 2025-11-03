# HTTS - Halal Traceability System

> Sistem traceability halal untuk melacak perjalanan sapi dari peternak hingga menjadi daging di konsumen akhir.

## 🎯 Tujuan Sistem

Sistem ini dirancang untuk:
- **Melacak** perjalanan sapi dari awal (peternak) sampai jadi daging
- **Menyimpan** setiap transaksi ke IPFS untuk transparansi
- **Memvalidasi** setiap entitas yang terlibat dalam transaksi
- **Generate QR Code** untuk traceability yang mudah
- **Menampilkan** semua entitas terdaftar (Teman Halal)

## 📋 Recent Updates (v2.0.0)

### ✅ Yang Sudah Diperbaiki:

1. **Database Sapi**: ✅ Ditambah `beratSapi`, field `idIndukanJantan` dihapus
2. **Database Profil**: ✅ Ditambah `fotoProfil`
3. **Validasi Entitas**: ✅ Setiap transaksi harus ke entitas yang terdaftar
4. **Upload IPFS**: ✅ Setiap transaksi otomatis upload ke IPFS
5. **Generate QR**: ✅ Endpoint untuk generate QR code sapi/daging
6. **Dashboard Inventaris**: ✅ Endpoint untuk inventaris sapi per entitas
7. **Landing Page**: ✅ Endpoint untuk menampilkan entitas terdaftar

## 🗂️ Struktur Project

```
HTTS/
├── BACKEND/                    # Node.js + Express + Prisma
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   ├── prisma/                # Database schema & migrations
│   ├── config/                # IPFS configuration
│   └── utils/                 # Helper functions
│
├── BLOCKCHAIN/                # Smart contracts (optional)
│   └── halal-traceability/
│
├── FRONTEND/                  # React + Vite
│   └── frontend-halal/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── context/
│       └── public/
│
└── Documentation/             # 📚 All docs
    ├── SUMMARY.md            # Quick overview
    ├── QUICK_REFERENCE.md    # Commands & endpoints
    ├── API_DOCUMENTATION.md  # Complete API docs
    ├── FRONTEND_IMPLEMENTATION_GUIDE.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── FLOW_DIAGRAMS.md
    └── CHANGELOG.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- IPFS (optional for development)

### 1. Backend Setup

```bash
cd BACKEND

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start server
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Start IPFS (Optional)

```bash
# Start IPFS daemon
ipfs daemon

# Verify IPFS is running
curl http://localhost:5001/api/v0/id
```

### 3. Frontend Setup

```bash
cd FRONTEND/frontend-halal

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📖 Documentation

### Quick Links
- 📘 [SUMMARY.md](./SUMMARY.md) - Overview singkat semua perubahan
- 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command & endpoint cheat sheet
- 📚 [API_DOCUMENTATION.md](./BACKEND/API_DOCUMENTATION.md) - Complete API guide
- 💻 [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md) - Guide untuk frontend dev
- ✅ [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Todo checklist
- 📊 [FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md) - System flow diagrams
- 📝 [CHANGELOG.md](./BACKEND/CHANGELOG.md) - Detailed changelog

### Untuk Backend Developer
1. Baca [SUMMARY.md](./SUMMARY.md) untuk overview
2. Baca [API_DOCUMENTATION.md](./BACKEND/API_DOCUMENTATION.md) untuk API details
3. Gunakan [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) untuk command reference

### Untuk Frontend Developer
1. Baca [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md)
2. Lihat [FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md) untuk memahami flow
3. Gunakan [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) untuk API endpoints

## 🔑 Key Features

### 1. Traceability Lengkap
```
Peternak → Pasar Hewan → RPH → Distributor → Horeka → End Customer
    ↓          ↓          ↓         ↓          ↓
  IPFS       IPFS       IPFS      IPFS       IPFS
```

### 2. Entity Validation
Setiap transaksi memvalidasi bahwa entitas sudah terdaftar dalam sistem:
```javascript
// Validasi otomatis di backend
validateEntity(entityType, entityId) → ✓ atau ✗
```

### 3. IPFS Integration
Semua transaksi otomatis disimpan ke IPFS:
```json
{
  "message": "Transaksi berhasil",
  "ipfsCid": "QmXxXxXxXxXx..."
}
```

### 4. QR Code Generation
Generate QR code untuk sapi atau daging:
```bash
POST /qr/generate
{ "sapiId": "uuid-sapi" }

Returns: base64 image yang bisa langsung ditampilkan
```

### 5. Dashboard Inventaris
Setiap entitas bisa melihat inventaris mereka:
```bash
GET /sapi/entity/PETERNAK/uuid-peternak
```

### 6. Landing Page - Teman Halal
Tampilkan semua mitra terdaftar:
```bash
GET /entities/registered

Returns: Semua entitas grouped by type
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **Prisma** - ORM untuk database
- **PostgreSQL** - Database
- **IPFS** - Decentralized storage
- **QRCode** - QR generation

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation

## 📊 Database Schema

### Main Models
- **User** - User accounts dengan roles
- **Profile** - Profile untuk setiap entitas (dengan fotoProfil ✨)
- **Sapi** - Data sapi (dengan beratSapi ✨)
- **Daging** - Data daging hasil penyembelihan
- **TransaksiPenjualan** - Transaksi jual beli (simplified ✨)
- **TransaksiPenyembelihan** - Transaksi penyembelihan (simplified ✨)
- **QR** - QR codes untuk sapi/daging
- **PengecekanSehat** - Health checks
- **PengecekanHalalSehat** - Halal & health checks

### Entities
- **Peternak** - Cattle farmer
- **PasarHewan** - Animal market
- **Jagal** - Butcher
- **RPH** - Slaughterhouse
- **Distributor** - Distributor
- **Horeka** - Hotel/Restaurant/Cafe
- **Regulator** - Government regulator

## 🔗 API Endpoints (Highlights)

### Sapi Management
```bash
POST   /sapi                              # Create sapi (with beratSapi)
GET    /sapi/entity/:entityType/:entityId # Get sapi by entity owner
```

### Transactions
```bash
POST   /transaksiPenjualan                # Create transaction (auto IPFS)
POST   /transaksiPenyembelihan/convert    # Convert sapi to daging (auto IPFS)
```

### QR Code
```bash
POST   /qr/generate                       # Generate QR for sapi/daging
```

### Entities
```bash
GET    /entities/registered               # Get all registered entities
POST   /entities/validate                 # Validate entity exists
```

Lihat [API_DOCUMENTATION.md](./BACKEND/API_DOCUMENTATION.md) untuk complete list.

## 🧪 Testing

### Test dengan cURL
```bash
# Create sapi
curl -X POST http://localhost:3000/sapi \
  -H "Content-Type: application/json" \
  -d '{"usia": 24, "jenis": "Limosin", "beratSapi": 450.5, ...}'

# Create transaksi
curl -X POST http://localhost:3000/transaksiPenjualan \
  -H "Content-Type: application/json" \
  -d '{"penjualType": "PETERNAK", "penjualId": "...", ...}'
```

### Test dengan Thunder Client/Postman
Import collection dari `BACKEND/postman_collection.json` (jika ada)

## 📝 TODO & Discussion Points

### Need Discussion:
- [ ] Workflow transaksi penyembelihan di RPH (approval needed?)
- [ ] Pengecekan halal dan sehat (siapa yang bisa melakukan?)
- [ ] Business rules (boleh jual sebelum cek kesehatan?)

### Next Priority:
- [ ] Frontend: Dashboard inventaris
- [ ] Frontend: Landing page Teman Halal
- [ ] Frontend: QR generation & display
- [ ] Backend: Pagination & filters
- [ ] Testing: Complete API testing

Lihat [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) untuk complete checklist.

## 🤝 Contributing

1. Read the documentation
2. Follow the implementation checklist
3. Test your changes
4. Submit PR with clear description

## 📞 Contact & Support

**Backend Developer**: [Your Name]
**Frontend Developer**: [Name]
**Project Manager**: [Name]

## 📄 License

[Your License Here]

---

## 🎓 Learning Resources

### Untuk memahami sistem:
1. Baca [SUMMARY.md](./SUMMARY.md) dulu
2. Lihat [FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md) untuk visual
3. Test API dengan [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Untuk development:
- Backend: [API_DOCUMENTATION.md](./BACKEND/API_DOCUMENTATION.md)
- Frontend: [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md)

---

**Version**: 2.0.0  
**Last Updated**: 2 November 2025  
**Status**: Ready for implementation

**Happy Coding! 🚀**
