# API Documentation - Halal Traceability System

## Base URL
```
http://localhost:3000
```

## New & Updated Endpoints

### 1. Sapi Management

#### Create Sapi (Updated)
```http
POST /sapi
Content-Type: application/json

{
  "usia": 24,
  "jenis": "Limosin",
  "kelamin": "Jantan",
  "beratSapi": 450.5,
  "asalType": "PETERNAK",
  "asalId": "uuid-peternak-id",
  "peternakId": "uuid-peternak-id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "usia": 24,
  "jenis": "Limosin",
  "kelamin": "Jantan",
  "beratSapi": 450.5,
  "asalType": "PETERNAK",
  "asalId": "uuid-peternak-id",
  "peternakId": "uuid-peternak-id",
  "pasarHewanId": null
}
```

#### Get Sapi by Entity (NEW)
```http
GET /sapi/entity/:entityType/:entityId
```

**Example:**
```http
GET /sapi/entity/PETERNAK/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
[
  {
    "id": "uuid",
    "usia": 24,
    "jenis": "Limosin",
    "kelamin": "Jantan",
    "beratSapi": 450.5,
    "peternak": {
      "id": "uuid",
      "nama": "Pak Budi",
      "alamat": "Jl. Contoh"
    },
    "transaksiPenjualan": [...],
    "pengecekanSehat": [...]
  }
]
```

---

### 2. Transaksi Penjualan

#### Create Transaksi Penjualan (Updated)
```http
POST /transaksiPenjualan
Content-Type: application/json

{
  "penjualType": "PETERNAK",
  "penjualId": "uuid-peternak",
  "pembeliType": "PASAR_HEWAN",
  "pembeliId": "uuid-pasar-hewan",
  "sapiId": "uuid-sapi",
  "jumlahQty": 1,
  "type": "SAPI"
}
```

**Response:**
```json
{
  "message": "Transaksi penjualan berhasil dibuat dan disimpan ke IPFS",
  "data": {
    "id": "uuid",
    "penjualType": "PETERNAK",
    "penjualId": "uuid-peternak",
    "pembeliType": "PASAR_HEWAN",
    "pembeliId": "uuid-pasar-hewan",
    "sapiId": "uuid-sapi",
    "jumlahQty": 1,
    "type": "SAPI",
    "timestamp": "2025-11-02T14:30:00.000Z",
    "cid": "QmXxXxXxXxXxXx...",
    "verifikasiPenjual": false,
    "verifikasiPembeli": false,
    "verifikasiRegulator": false
  },
  "ipfsCid": "QmXxXxXxXxXxXx..."
}
```

**Features:**
- ✅ Validasi entitas penjual dan pembeli ada di sistem
- ✅ Upload data transaksi ke IPFS otomatis
- ✅ Update ownership sapi otomatis
- ✅ Return IPFS CID

---

### 3. Transaksi Penyembelihan

#### Create Transaksi Penyembelihan (Updated)
```http
POST /transaksiPenyembelihan
Content-Type: application/json

{
  "penyembelihType": "RPH",
  "penyembelihId": "uuid-rph",
  "penerimaType": "DISTRIBUTOR",
  "penerimaId": "uuid-distributor",
  "sapiId": "uuid-sapi"
}
```

**Response:**
```json
{
  "message": "Transaksi penyembelihan berhasil dibuat dan disimpan ke IPFS",
  "data": {
    "id": "uuid",
    "penyembelihType": "RPH",
    "penyembelihId": "uuid-rph",
    "penerimaType": "DISTRIBUTOR",
    "penerimaId": "uuid-distributor",
    "sapiId": "uuid-sapi",
    "timestamp": "2025-11-02T14:30:00.000Z",
    "cid": "QmYyYyYyYyYyYy..."
  },
  "ipfsCid": "QmYyYyYyYyYyYy..."
}
```

#### Convert Sapi to Daging (Updated)
```http
POST /transaksiPenyembelihan/convert
Content-Type: application/json

{
  "sapiId": "uuid-sapi",
  "penyembelihType": "RPH",
  "penyembelihId": "uuid-rph",
  "penerimaType": "DISTRIBUTOR",
  "penerimaId": "uuid-distributor",
  "berat": 250.5,
  "idPengecekanHalalSehat": "uuid-pengecekan"
}
```

**Response:**
```json
{
  "message": "Sapi berhasil dikonversi menjadi daging dan disimpan ke IPFS",
  "data": {
    "id": "uuid",
    "penyembelihType": "RPH",
    "penyembelihId": "uuid-rph",
    "penerimaType": "DISTRIBUTOR",
    "penerimaId": "uuid-distributor",
    "sapiId": "uuid-sapi",
    "timestamp": "2025-11-02T14:30:00.000Z",
    "cid": "QmZzZzZzZzZzZz..."
  },
  "daging": {
    "id": "uuid-daging",
    "sapiId": "uuid-sapi",
    "berat": 250.5
  },
  "ipfsCid": "QmZzZzZzZzZzZz..."
}
```

**Features:**
- ✅ Validasi entitas penyembelih (JAGAL/RPH) ada di sistem
- ✅ Validasi entitas penerima (DISTRIBUTOR/HOREKA/RPH) ada di sistem
- ✅ Validasi pengecekan halal sehat sudah dilakukan
- ✅ Cek sapi belum pernah disembelih sebelumnya
- ✅ Upload ke IPFS otomatis
- ✅ Create record daging
- ✅ Update ownership sapi

---

### 4. QR Code Generation (NEW)

#### Generate QR Code
```http
POST /qr/generate
Content-Type: application/json

{
  "sapiId": "uuid-sapi"
}
```

**Or for Daging:**
```json
{
  "dagingId": "uuid-daging"
}
```

**Response:**
```json
{
  "message": "QR Code berhasil dibuat untuk Sapi",
  "qr": {
    "id": "uuid-qr",
    "sapiId": "uuid-sapi",
    "dagingId": null,
    "urlQR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**QR Data Structure:**
```json
{
  "type": "SAPI",
  "id": "uuid-sapi",
  "jenis": "Limosin",
  "usia": 24,
  "kelamin": "Jantan",
  "beratSapi": 450.5,
  "asalType": "PETERNAK",
  "asalId": "uuid-peternak",
  "traceUrl": "http://localhost:5173/trace/sapi/uuid-sapi"
}
```

**Usage:**
- QR image dapat langsung ditampilkan dalam `<img>` tag
- QR dapat di-scan untuk mendapat informasi traceability lengkap
- URL trace akan redirect ke halaman detail di frontend

---

### 5. Entity Management (NEW)

#### Get All Registered Entities
```http
GET /entities/registered
```

**Response:**
```json
{
  "message": "Daftar entitas terdaftar berhasil diambil",
  "grouped": {
    "peternak": [
      {
        "id": "uuid",
        "nama": "Pak Budi",
        "alamat": "Jl. Contoh No. 123",
        "noTelepon": "081234567890",
        "sertifikatNKV": "NKV-001",
        "type": "PETERNAK"
      }
    ],
    "pasarHewan": [...],
    "jagal": [...],
    "rph": [...],
    "distributor": [...],
    "horeka": [...]
  },
  "all": [...],
  "count": {
    "peternak": 5,
    "pasarHewan": 3,
    "jagal": 2,
    "rph": 4,
    "distributor": 6,
    "horeka": 8,
    "total": 28
  }
}
```

**Usage:**
- Untuk menampilkan di landing page section "Teman Halal"
- Menampilkan semua mitra yang terdaftar di sistem

#### Get Entity by Type and ID
```http
GET /entities/:entityType/:entityId
```

**Example:**
```http
GET /entities/PETERNAK/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "type": "PETERNAK",
  "data": {
    "id": "uuid",
    "nama": "Pak Budi",
    "alamat": "Jl. Contoh No. 123",
    "noTelepon": "081234567890",
    "jumlahSapi": 50,
    "sertifikatNKV": "NKV-001",
    "sapi": [...],
    "profiles": [...]
  }
}
```

#### Validate Entity Exists
```http
POST /entities/validate
Content-Type: application/json

{
  "entityType": "PETERNAK",
  "entityId": "uuid-peternak"
}
```

**Response:**
```json
{
  "entityType": "PETERNAK",
  "entityId": "uuid-peternak",
  "exists": true,
  "message": "Entitas ditemukan dalam sistem"
}
```

**Usage:**
- Untuk validasi sebelum membuat transaksi
- Untuk cek apakah entitas sudah terdaftar

---

## Error Handling

### Validation Errors

**Entity Not Found:**
```json
{
  "error": "Peternak dengan ID xxx tidak ditemukan dalam sistem"
}
```

**Invalid Entity Type:**
```json
{
  "error": "penyembelihType harus JAGAL atau RPH"
}
```

**Sapi Already Slaughtered:**
```json
{
  "error": "Sapi dengan ID xxx sudah disembelih sebelumnya"
}
```

### IPFS Errors

**IPFS Upload Failed:**
```json
{
  "error": "Error uploading to IPFS: ..."
}
```

Make sure IPFS daemon is running:
```bash
ipfs daemon
```

---

## Complete Flow Example

### 1. Peternak membuat sapi baru
```bash
curl -X POST http://localhost:3000/sapi \
  -H "Content-Type: application/json" \
  -d '{
    "usia": 24,
    "jenis": "Limosin",
    "kelamin": "Jantan",
    "beratSapi": 450.5,
    "asalType": "PETERNAK",
    "asalId": "peternak-123",
    "peternakId": "peternak-123"
  }'
```

### 2. Peternak jual sapi ke Pasar Hewan
```bash
curl -X POST http://localhost:3000/transaksiPenjualan \
  -H "Content-Type: application/json" \
  -d '{
    "penjualType": "PETERNAK",
    "penjualId": "peternak-123",
    "pembeliType": "PASAR_HEWAN",
    "pembeliId": "pasar-456",
    "sapiId": "sapi-789",
    "jumlahQty": 1,
    "type": "SAPI"
  }'
```
→ Data transaksi otomatis ter-upload ke IPFS
→ Ownership sapi berpindah dari peternak ke pasar hewan

### 3. Generate QR untuk sapi
```bash
curl -X POST http://localhost:3000/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sapiId": "sapi-789"
  }'
```
→ QR code berisi informasi traceability lengkap

### 4. Pasar Hewan jual sapi ke RPH
```bash
curl -X POST http://localhost:3000/transaksiPenjualan \
  -H "Content-Type: application/json" \
  -d '{
    "penjualType": "PASAR_HEWAN",
    "penjualId": "pasar-456",
    "pembeliType": "RPH",
    "pembeliId": "rph-321",
    "sapiId": "sapi-789",
    "jumlahQty": 1,
    "type": "SAPI"
  }'
```

### 5. RPH menyembelih sapi menjadi daging
```bash
curl -X POST http://localhost:3000/transaksiPenyembelihan/convert \
  -H "Content-Type: application/json" \
  -d '{
    "sapiId": "sapi-789",
    "penyembelihType": "RPH",
    "penyembelihId": "rph-321",
    "penerimaType": "DISTRIBUTOR",
    "penerimaId": "dist-654",
    "berat": 250.5,
    "idPengecekanHalalSehat": "check-999"
  }'
```
→ Create record daging
→ Data transaksi upload ke IPFS
→ Sapi tidak bisa disembelih lagi

### 6. Generate QR untuk daging
```bash
curl -X POST http://localhost:3000/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "dagingId": "daging-xxx"
  }'
```

### 7. Distributor jual daging ke Horeka
```bash
curl -X POST http://localhost:3000/transaksiPenjualan \
  -H "Content-Type: application/json" \
  -d '{
    "penjualType": "DISTRIBUTOR",
    "penjualId": "dist-654",
    "pembeliType": "HOREKA",
    "pembeliId": "horeka-888",
    "dagingId": "daging-xxx",
    "jumlahQty": 50,
    "type": "DAGING"
  }'
```

### 8. Get entitas untuk landing page
```bash
curl http://localhost:3000/entities/registered
```
→ Tampilkan di section "Teman Halal"

---

## Environment Variables

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/htts_db"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

---

## Setup & Installation

1. **Install dependencies**
```bash
cd BACKEND
npm install
```

2. **Setup database**
```bash
npx prisma migrate dev
npx prisma generate
```

3. **Start IPFS daemon**
```bash
ipfs daemon
```

4. **Start server**
```bash
npm run dev
```

Server will run on `http://localhost:3000`
