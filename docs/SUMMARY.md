# Summary Perubahan Sistem - HTTS (Halal Traceability System)

## ✅ Yang Sudah Dikerjakan

### 1. Database Schema Updates
- ✅ **Sapi**: Ditambah field `beratSapi` (Float)
- ✅ **Profile**: Ditambah field `fotoProfil` (String)
- ✅ **TransaksiPenjualan**: Disederhanakan dengan `penjualId` dan `pembeliId`
- ✅ **TransaksiPenyembelihan**: Disederhanakan dengan `penyembelihId` dan `penerimaId`

### 2. Validasi Entitas
✅ Setiap transaksi sekarang **WAJIB** memvalidasi:
- Penjual/Pembeli sudah terdaftar dalam sistem
- Entitas penyembelih (JAGAL/RPH) ada di database
- Entitas penerima (DISTRIBUTOR/HOREKA/RPH) ada di database
- Error message jelas dalam Bahasa Indonesia

### 3. IPFS Integration
✅ Semua transaksi otomatis upload ke IPFS:
- **Transaksi Penjualan** → upload data transaksi, return CID
- **Transaksi Penyembelihan** → upload data penyembelihan, return CID
- **Convert Sapi to Daging** → upload semua data, return CID

### 4. QR Code Generation
✅ Endpoint baru untuk generate QR:
- `POST /qr/generate` dengan `sapiId` atau `dagingId`
- QR berisi data traceability lengkap
- Return QR sebagai base64 image (siap display)
- QR bisa di-download dan di-print

### 5. Dashboard Inventaris
✅ Endpoint baru untuk inventaris per entitas:
- `GET /sapi/entity/:entityType/:entityId`
- Return sapi yang dimiliki oleh entitas tertentu
- Include relasi lengkap (transaksi, pengecekan, dll)

### 6. Landing Page - "Teman Halal"
✅ Endpoint baru untuk entitas terdaftar:
- `GET /entities/registered` → Semua entitas terdaftar
- `GET /entities/:entityType/:entityId` → Detail entitas
- `POST /entities/validate` → Cek entitas exists atau tidak
- Grouped by type (Peternak, Pasar Hewan, RPH, dll)

### 7. API Documentation
✅ Dokumentasi lengkap dibuat:
- `BACKEND/API_DOCUMENTATION.md` - Complete API guide
- `BACKEND/CHANGELOG.md` - Summary perubahan
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Guide untuk frontend dev

---

## 📋 TODO / Perlu Diskusi

### 1. ❓ Transaksi Penyembelihan di RPH
**Pertanyaan:**
- Apakah perlu approval dari multiple parties?
- Workflow: Jagal → RPH → Distributor atau bisa langsung RPH → Distributor?
- Apakah perlu pengecekan tambahan sebelum penyembelihan?

**Current Implementation:**
```
POST /transaksiPenyembelihan/convert
- Validasi sapi exists
- Validasi pengecekan halal sehat sudah dilakukan
- Create daging record
- Upload ke IPFS
```

### 2. ❓ Pengecekan Halal dan Sehat
**Pertanyaan:**
- Siapa yang bisa melakukan pengecekan? (Regulator only atau RPH juga?)
- Apakah perlu approval dari regulator?
- Flow pengecekan sehat vs halal sehat → bedanya apa?
- Kapan dilakukan? (sebelum transaksi, sebelum penyembelihan, atau kapan?)

**Current Implementation:**
```
POST /pengecekanSehat
POST /pengecekanHalalSehat
- Boolean result untuk setiap item check
- Linked to sapiId
- Upload ke IPFS (optional, belum diimplementasi)
```

### 3. ❓ Business Rules
**Perlu klarifikasi:**
- Apakah sapi bisa dijual sebelum cek kesehatan?
- Apakah cek halal wajib sebelum penyembelihan?
- Minimum data yang harus ada sebelum generate QR?
- Siapa yang bisa lihat semua data vs data terbatas?

---

## 🚀 Next Steps

### Backend (High Priority)
1. [ ] Install `qrcode` package: `npm install qrcode`
2. [ ] Run migration: `npx prisma migrate dev`
3. [ ] Test IPFS daemon running: `ipfs daemon`
4. [ ] Test all endpoints dengan Postman/Thunder Client

### Backend (Medium Priority)
5. [ ] Implement approval workflow untuk transaksi penyembelihan
6. [ ] Add IPFS upload untuk pengecekan sehat/halal
7. [ ] Add pagination untuk list endpoints
8. [ ] Add filters & search functionality

### Frontend (High Priority)
9. [ ] Dashboard inventaris sapi per entitas
10. [ ] Landing page section "Teman Halal"
11. [ ] Form transaksi penjualan dengan validasi
12. [ ] QR code generator & display
13. [ ] Traceability page (hasil scan QR)

### Frontend (Medium Priority)
14. [ ] Form transaksi penyembelihan
15. [ ] Form pengecekan sehat/halal
16. [ ] Analytics dashboard
17. [ ] Export to Excel/PDF features

### Discussion & Design
18. [ ] Diskusi workflow penyembelihan di RPH
19. [ ] Diskusi pengecekan halal dan sehat
20. [ ] Design approval system (jika perlu)
21. [ ] Design role & permissions

---

## 🔧 Installation & Setup

### 1. Backend Setup
```bash
cd BACKEND

# Install dependencies (termasuk qrcode)
npm install

# Run migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start server
npm run dev
```

### 2. Start IPFS Daemon
```bash
ipfs daemon
```

### 3. Environment Variables
Create `BACKEND/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/htts_db"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

---

## 📊 Database Changes Summary

### Sapi Model (Before → After)
```prisma
// BEFORE
model Sapi {
  id       String @id @default(uuid())
  usia     Int
  jenis    String
  kelamin  String
  // ... other fields
}

// AFTER
model Sapi {
  id        String @id @default(uuid())
  usia      Int
  jenis     String
  kelamin   String
  beratSapi Float?  // ✨ NEW
  asalType  EntityType
  asalId    String
  // ... other fields
}
```

### Profile Model (Before → After)
```prisma
// BEFORE
model Profile {
  id         String     @id @default(uuid())
  entityType EntityType
  // ... other fields
}

// AFTER
model Profile {
  id          String     @id @default(uuid())
  entityType  EntityType
  fotoProfil  String?    // ✨ NEW
  // ... other fields
}
```

### TransaksiPenjualan (Simplified)
```prisma
// AFTER (Simplified)
model TransaksiPenjualan {
  id          String     @id @default(uuid())
  penjualType EntityType
  penjualId   String     // ✨ Simplified (was multiple IDs)
  pembeliType EntityType
  pembeliId   String     // ✨ Simplified (was multiple IDs)
  sapiId      String?
  dagingId    String?
  jumlahQty   Int
  type        String
  timestamp   DateTime   @default(now())
  cid         String     // ✨ IPFS CID
  // ... verification fields
}
```

---

## 🎯 Key Features Implemented

### 1. Traceability Flow
```
Peternak → Input Sapi (dengan berat)
  ↓
Transaksi Penjualan (upload ke IPFS)
  ↓
Pasar Hewan → RPH
  ↓
Pengecekan Halal Sehat
  ↓
Penyembelihan (upload ke IPFS)
  ↓
Create Daging
  ↓
Distributor → Horeka
  ↓
End Customer (scan QR)
```

### 2. Data Flow ke IPFS
```
Setiap Transaksi:
{
  penjualType: "PETERNAK",
  penjualId: "uuid",
  pembeliType: "PASAR_HEWAN",
  pembeliId: "uuid",
  sapiId: "uuid",
  jumlahQty: 1,
  timestamp: "2025-11-02T..."
}
  ↓
Upload to IPFS
  ↓
Get CID: QmXxXxXx...
  ↓
Store in Database
```

### 3. QR Code Data
```json
{
  "type": "SAPI",
  "id": "uuid-sapi",
  "jenis": "Limosin",
  "usia": 24,
  "beratSapi": 450.5,
  "asalType": "PETERNAK",
  "traceUrl": "http://localhost:5173/trace/sapi/uuid-sapi"
}
```

---

## 📞 Contact & Support

**Backend Developer**: [Your Name]
**Frontend Developer**: [Frontend Dev Name]
**Project Manager**: [PM Name]

**Documentation**:
- API Docs: `BACKEND/API_DOCUMENTATION.md`
- Frontend Guide: `FRONTEND_IMPLEMENTATION_GUIDE.md`
- Changelog: `BACKEND/CHANGELOG.md`

**Repository**: [Git Repo URL]

---

## 🐛 Known Issues / Limitations

1. **IPFS**: Perlu IPFS daemon berjalan (localhost:5001)
2. **Migration**: Perlu run manual migration untuk update schema
3. **QR Package**: Perlu install `qrcode` package
4. **Validation**: Belum ada rate limiting untuk API
5. **Auth**: Belum implement JWT refresh token

---

## 📝 Notes

- Semua response API sekarang dalam **Bahasa Indonesia**
- Error messages jelas dan deskriptif
- Setiap transaksi return **IPFS CID**
- QR code return sebagai **base64 image** (siap display)
- Validasi entitas dilakukan di **backend level**
- Database menggunakan **UUID** untuk semua ID

---

**Last Updated**: 2 November 2025
**Version**: 2.0.0
