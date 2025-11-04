# Dokumentasi Update Sistem Traceability Halal

## Ringkasan Perubahan

Berikut adalah perubahan yang telah dilakukan pada sistem sesuai dengan brief yang diberikan:

### 1. ✅ Database Sapi - Perubahan Schema

**Perubahan pada `schema.prisma`:**
- ✅ **Ditambahkan**: `beratSapi Float?` - field untuk menyimpan berat sapi
- ✅ **Dihapus**: Field `idIndukanJantan` (tidak ada di schema sebelumnya, sudah tidak ada)
- ✅ **Ditambahkan**: `asalType` dan `asalId` - untuk tracking asal sapi dari entitas mana

**Model Sapi yang diupdate:**
```prisma
model Sapi {
  id                     String     @id @default(uuid())
  usia                   Int
  jenis                  String
  kelamin                String
  beratSapi              Float?     // BARU: Berat sapi
  asalType               EntityType
  asalId                 String
  // ... fields lainnya
}
```

### 2. ✅ Database Profile - Foto Profil

**Perubahan pada `schema.prisma`:**
- ✅ **Ditambahkan**: `fotoProfil String?` pada model Profile

```prisma
model Profile {
  id          String     @id @default(uuid())
  entityType  EntityType
  fotoProfil  String?    // BARU: Foto profil entitas
  // ... fields lainnya
}
```

### 3. ✅ Validasi Entitas dalam Transaksi

**Controller yang diupdate:**

#### `transaksiPenjualanController.js`
- ✅ Menambahkan fungsi `validateEntity()` untuk memvalidasi penjual dan pembeli
- ✅ Memastikan setiap transaksi hanya bisa dilakukan dengan entitas yang terdaftar dalam sistem
- ✅ Simplified schema: menggunakan `penjualId` dan `pembeliId` langsung (tidak perlu field terpisah per entitas)
- ✅ Error handling yang lebih baik dengan pesan dalam Bahasa Indonesia

#### `transaksiPenyembelihanController.js`
- ✅ Validasi entitas penyembelih (JAGAL atau RPH)
- ✅ Validasi entitas penerima (DISTRIBUTOR, HOREKA, atau RPH)
- ✅ Validasi pengecekan halal sehat sudah dilakukan
- ✅ Cek apakah sapi sudah disembelih sebelumnya

### 4. ✅ Upload ke IPFS Setiap Transaksi

**Implementasi:**
- ✅ `transaksiPenjualanController.js` - Upload data transaksi ke IPFS setelah create
- ✅ `transaksiPenyembelihanController.js` - Upload data transaksi penyembelihan ke IPFS
- ✅ `convertSapiToDaging()` - Upload data konversi sapi ke daging ke IPFS
- ✅ Return CID (Content Identifier) dari IPFS untuk setiap transaksi

**Response API akan include:**
```json
{
  "message": "Transaksi berhasil...",
  "data": { /* data transaksi */ },
  "ipfsCid": "QmXXXXXX..." // CID dari IPFS
}
```

### 5. ✅ Generate QR Code

**File baru: `qrController.js`**
- ✅ Fungsi `generateQR()` untuk generate QR code untuk sapi atau daging
- ✅ QR code berisi informasi lengkap traceability
- ✅ QR code disimpan sebagai Data URL dalam database
- ✅ Return QR image yang bisa langsung ditampilkan

**Endpoint:**
- `POST /qr/generate` - Generate QR code untuk sapi atau daging

**Request Body:**
```json
{
  "sapiId": "uuid-sapi" // atau
  "dagingId": "uuid-daging"
}
```

**Response:**
```json
{
  "message": "QR Code berhasil dibuat...",
  "qr": { /* QR record */ },
  "qrImage": "data:image/png;base64,..." // QR code image
}
```

### 6. ✅ Inventaris Sapi Per Entitas

**File: `sapiController.js`**
- ✅ Fungsi `getSapiByEntity()` untuk mendapatkan sapi berdasarkan entitas pemilik
- ✅ Support untuk PETERNAK dan PASAR_HEWAN
- ✅ Include relasi lengkap (peternak, pasarHewan, transaksi, pengecekan)

**Endpoint:**
- `GET /sapi/entity/:entityType/:entityId` - Get sapi by entity

**Contoh:**
- `GET /sapi/entity/PETERNAK/uuid-peternak`
- `GET /sapi/entity/PASAR_HEWAN/uuid-pasar-hewan`

### 7. ✅ Landing Page - Teman Halal (Entitas Terdaftar)

**File baru: `entityController.js`**
- ✅ Fungsi `getAllRegisteredEntities()` - Mendapatkan semua entitas terdaftar
- ✅ Fungsi `getEntityById()` - Get detail entitas by type dan ID
- ✅ Fungsi `validateEntity()` - Validasi apakah entitas exists

**Endpoint:**
- `GET /entities/registered` - Get semua entitas terdaftar
- `GET /entities/:entityType/:entityId` - Get detail entitas
- `POST /entities/validate` - Validate entitas exists

**Response `/entities/registered`:**
```json
{
  "message": "Daftar entitas terdaftar berhasil diambil",
  "grouped": {
    "peternak": [...],
    "pasarHewan": [...],
    "jagal": [...],
    "rph": [...],
    "distributor": [...],
    "horeka": [...]
  },
  "all": [...], // semua entitas dalam 1 array
  "count": {
    "peternak": 10,
    "pasarHewan": 5,
    // ... total per kategori
  }
}
```

### 8. ✅ Simplified Schema untuk Transaksi

**TransaksiPenjualan:**
```prisma
model TransaksiPenjualan {
  id                String     @id @default(uuid())
  penjualType       EntityType
  penjualId         String      // SIMPLIFIED: langsung ID entitas
  pembeliType       EntityType
  pembeliId         String      // SIMPLIFIED: langsung ID entitas
  sapiId            String?
  dagingId          String?
  jumlahQty         Int
  type              String
  timestamp         DateTime  @default(now())
  cid               String     // CID dari IPFS
  // ... fields lainnya
}
```

**TransaksiPenyembelihan:**
```prisma
model TransaksiPenyembelihan {
  id              String     @id @default(uuid())
  penyembelihType EntityType  // JAGAL atau RPH
  penyembelihId   String
  penerimaType    EntityType  // DISTRIBUTOR, HOREKA, atau RPH
  penerimaId      String
  sapiId          String
  timestamp       DateTime  @default(now())
  cid             String      // CID dari IPFS
}
```

## Instalasi & Setup

### 1. Install Dependencies
```bash
cd BACKEND
npm install qrcode
```

### 2. Run Migration
```bash
npx prisma migrate dev --name update_sapi_profile_transaksi
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Start Server
```bash
npm run dev
```

## API Endpoints Baru

### Sapi
- `GET /sapi/entity/:entityType/:entityId` - Get sapi by entity owner

### QR Code
- `POST /qr/generate` - Generate QR code untuk sapi/daging

### Entities (Landing Page)
- `GET /entities/registered` - Get semua entitas terdaftar
- `GET /entities/:entityType/:entityId` - Get detail entitas
- `POST /entities/validate` - Validate entitas exists

## Flow Sistem

### 1. Peternak Input Sapi
```
POST /sapi
{
  "usia": 24,
  "jenis": "Limosin",
  "kelamin": "Jantan",
  "beratSapi": 450.5,
  "asalType": "PETERNAK",
  "asalId": "uuid-peternak",
  "peternakId": "uuid-peternak"
}
```

### 2. Transaksi Penjualan Sapi
```
POST /transaksiPenjualan
{
  "penjualType": "PETERNAK",
  "penjualId": "uuid-peternak",
  "pembeliType": "PASAR_HEWAN",
  "pembeliId": "uuid-pasar-hewan",
  "sapiId": "uuid-sapi",
  "jumlahQty": 1,
  "type": "SAPI"
}
→ Upload ke IPFS otomatis
→ Update ownership sapi
```

### 3. Penyembelihan Sapi
```
POST /transaksiPenyembelihan/convert
{
  "sapiId": "uuid-sapi",
  "penyembelihType": "RPH",
  "penyembelihId": "uuid-rph",
  "penerimaType": "DISTRIBUTOR",
  "penerimaId": "uuid-distributor",
  "berat": 250.5,
  "idPengecekanHalalSehat": "uuid-pengecekan"
}
→ Upload ke IPFS otomatis
→ Create record Daging
→ Update sapi ownership
```

### 4. Generate QR Code
```
POST /qr/generate
{
  "sapiId": "uuid-sapi"  // atau "dagingId"
}
→ Generate QR dengan data traceability lengkap
→ Return QR image sebagai base64
```

### 5. Landing Page - Tampilkan Entitas
```
GET /entities/registered
→ Mendapatkan semua entitas terdaftar
→ Untuk ditampilkan di section "Teman Halal"
```

## Catatan Penting

1. **IPFS Node**: Pastikan IPFS daemon berjalan di `localhost:5001`
   ```bash
   ipfs daemon
   ```

2. **Environment Variable**: Tambahkan di `.env`
   ```env
   DATABASE_URL="postgresql://..."
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Validasi Entitas**: Setiap transaksi akan validasi bahwa entitas sudah terdaftar dalam sistem

4. **QR Code**: Berisi URL traceability ke frontend untuk scan

5. **IPFS**: Hanya data transaksi yang disimpan ke IPFS, bukan data master

## TODO / Diskusi

- [ ] Review pengecekan halal dan sehat (flow & validasi)
- [ ] Detail flow transaksi penyembelihan di RPH (apakah perlu approval?)
- [ ] Frontend implementation untuk dashboard inventaris per entitas
- [ ] Frontend implementation untuk landing page "Teman Halal"
- [ ] Testing IPFS upload dalam production environment
