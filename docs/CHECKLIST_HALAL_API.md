# Checklist Halal Penyembelihan - API Documentation

## Overview
API endpoints untuk mengelola checklist halal yang digunakan dalam proses verifikasi penyembelihan. Checklist dibuat oleh Regulator dan digunakan oleh RPH saat proses pra dan pasca penyembelihan.

## Base URL
```
http://localhost:3000/transaksiPenyembelihan
```

## Authentication
Semua endpoint memerlukan JWT token dalam header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get All Checklist Items

Mendapatkan semua item checklist halal yang aktif.

**Endpoint:**
```http
GET /transaksiPenyembelihan/checklist-halal
```

**Authorization:**
- Role: REGULATOR, RPH, ADMIN

**Response:**
```json
{
  "message": "Checklist halal retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "pertanyaan": "Apakah hewan berasal dari sumber yang terverifikasi halal?",
      "tipe": "PRA_PENYEMBELIHAN",
      "kategori": "Sumber Hewan",
      "urutan": 1,
      "isAktif": true,
      "regulatorId": "uuid-regulator",
      "regulator": {
        "id": "uuid-regulator",
        "nama": "Ahmad Regulator",
        "instansi": "Kemenag RI"
      },
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    }
  ]
}
```

**Tipe Checklist:**
- `PRA_PENYEMBELIHAN`: Checklist yang harus diisi RPH **sebelum** proses penyembelihan
- `PASCA_PENYEMBELIHAN`: Checklist yang harus diisi RPH **setelah** proses penyembelihan selesai

---

### 2. Create Checklist Item

Membuat item checklist halal baru.

**Endpoint:**
```http
POST /transaksiPenyembelihan/checklist-halal
```

**Authorization:**
- Role: REGULATOR

**Request Body:**
```json
{
  "pertanyaan": "Apakah proses penyembelihan dilakukan sesuai syariat Islam?",
  "tipe": "PASCA_PENYEMBELIHAN",
  "kategori": "Proses Penyembelihan",
  "urutan": 5
}
```

**Field Validation:**
- `pertanyaan` (required): Pertanyaan checklist
- `tipe` (required): `PRA_PENYEMBELIHAN` atau `PASCA_PENYEMBELIHAN`
- `kategori` (optional): Kategori untuk mengelompokkan pertanyaan sejenis
- `urutan` (optional): Urutan tampilan (default: 0)

**Response:**
```json
{
  "message": "Item checklist berhasil dibuat",
  "data": {
    "id": "uuid",
    "pertanyaan": "Apakah proses penyembelihan dilakukan sesuai syariat Islam?",
    "tipe": "PASCA_PENYEMBELIHAN",
    "kategori": "Proses Penyembelihan",
    "urutan": 5,
    "isAktif": true,
    "regulatorId": "uuid-regulator",
    "createdAt": "2026-01-02T10:00:00.000Z",
    "updatedAt": "2026-01-02T10:00:00.000Z"
  }
}
```

**Notes:**
- `regulatorId` otomatis diisi dari user yang sedang login
- Item checklist akan langsung aktif (`isAktif: true`)
- Urutan menentukan posisi tampilan saat RPH mengisi checklist

---

### 3. Update Checklist Item

Update item checklist yang sudah ada.

**Endpoint:**
```http
PUT /transaksiPenyembelihan/checklist-halal/:id
```

**Authorization:**
- Role: REGULATOR

**Request Body:**
```json
{
  "pertanyaan": "Apakah proses penyembelihan dilakukan sesuai syariat Islam? (Updated)",
  "tipe": "PASCA_PENYEMBELIHAN",
  "kategori": "Proses Penyembelihan",
  "urutan": 5,
  "isAktif": true
}
```

**Response:**
```json
{
  "message": "Item checklist berhasil diupdate",
  "data": {
    "id": "uuid",
    "pertanyaan": "Apakah proses penyembelihan dilakukan sesuai syariat Islam? (Updated)",
    "tipe": "PASCA_PENYEMBELIHAN",
    "kategori": "Proses Penyembelihan",
    "urutan": 5,
    "isAktif": true,
    "regulatorId": "uuid-regulator",
    "createdAt": "2026-01-02T10:00:00.000Z",
    "updatedAt": "2026-01-02T11:30:00.000Z"
  }
}
```

---

### 4. Delete Checklist Item (Soft Delete)

Menonaktifkan item checklist (soft delete).

**Endpoint:**
```http
DELETE /transaksiPenyembelihan/checklist-halal/:id
```

**Authorization:**
- Role: REGULATOR

**Response:**
```json
{
  "message": "Item checklist berhasil dinonaktifkan",
  "data": {
    "id": "uuid",
    "pertanyaan": "Apakah proses penyembelihan dilakukan sesuai syariat Islam?",
    "tipe": "PASCA_PENYEMBELIHAN",
    "kategori": "Proses Penyembelihan",
    "urutan": 5,
    "isAktif": false,
    "regulatorId": "uuid-regulator",
    "createdAt": "2026-01-02T10:00:00.000Z",
    "updatedAt": "2026-01-02T12:00:00.000Z"
  }
}
```

**Notes:**
- Soft delete: item tidak dihapus dari database, hanya diset `isAktif: false`
- Item yang sudah nonaktif tidak akan muncul di GET all checklist
- Item yang sudah nonaktif masih bisa diaktifkan kembali melalui endpoint UPDATE

---

## Frontend Integration

### React Component Structure

Komponen frontend telah dipecah menjadi modular components:

```
src/modules/regulator/
├── pages/
│   └── RegulatorChecklist.jsx          # Main orchestrator
├── components/
│   ├── ChecklistForm.jsx               # Form create/edit
│   ├── ChecklistTable.jsx              # Table display
│   └── ChecklistInfoCard.jsx           # Info cards
```

### Usage Example

#### Fetch All Checklist Items
```javascript
const token = localStorage.getItem('token');
const headers = { 
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const res = await fetch('http://localhost:3000/transaksiPenyembelihan/checklist-halal', { headers });
const data = await res.json();
const items = data.data || [];

// Filter by type
const checklistPra = items.filter(item => item.tipe === 'PRA_PENYEMBELIHAN');
const checklistPasca = items.filter(item => item.tipe === 'PASCA_PENYEMBELIHAN');
```

#### Create Checklist Item
```javascript
const token = localStorage.getItem('token');
const headers = { 
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const payload = {
  pertanyaan: "Apakah hewan bebas dari penyakit?",
  tipe: "PRA_PENYEMBELIHAN",
  kategori: "Kesehatan Hewan",
  urutan: 2
};

const res = await fetch('http://localhost:3000/transaksiPenyembelihan/checklist-halal', {
  method: 'POST',
  headers,
  body: JSON.stringify(payload)
});

const data = await res.json();
if (res.ok) {
  console.log('Checklist created:', data.data);
}
```

#### Update Checklist Item
```javascript
const itemId = 'uuid-of-item';
const token = localStorage.getItem('token');
const headers = { 
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const payload = {
  pertanyaan: "Apakah hewan bebas dari penyakit menular?",
  tipe: "PRA_PENYEMBELIHAN",
  kategori: "Kesehatan Hewan",
  urutan: 2,
  isAktif: true
};

const res = await fetch(`http://localhost:3000/transaksiPenyembelihan/checklist-halal/${itemId}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify(payload)
});

const data = await res.json();
```

#### Delete (Deactivate) Checklist Item
```javascript
const itemId = 'uuid-of-item';
const token = localStorage.getItem('token');
const headers = { 
  'Authorization': `Bearer ${token}`
};

const res = await fetch(`http://localhost:3000/transaksiPenyembelihan/checklist-halal/${itemId}`, {
  method: 'DELETE',
  headers
});

const data = await res.json();
```

---

## Database Schema

### ItemChecklistHalal Model
```prisma
model ItemChecklistHalal {
  id          String   @id @default(uuid())
  pertanyaan  String   // Pertanyaan checklist
  tipe        String   // "PRA_PENYEMBELIHAN" atau "PASCA_PENYEMBELIHAN"
  kategori    String?  // Kategori pertanyaan (opsional)
  urutan      Int      @default(0) // Urutan tampilan
  isAktif     Boolean  @default(true) // Apakah item ini aktif
  
  regulatorId String?  // Regulator yang membuat item ini
  regulator   Regulator? @relation(fields: [regulatorId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relasi ke jawaban checklist
  jawaban     ChecklistPenyembelihan[]
}
```

### ChecklistPenyembelihan Model
```prisma
model ChecklistPenyembelihan {
  id                         String   @id @default(uuid())
  
  transaksiPenyembelihanId   String
  transaksiPenyembelihan     TransaksiPenyembelihan @relation(fields: [transaksiPenyembelihanId], references: [id], onDelete: Cascade)
  
  itemChecklistId            String
  itemChecklist              ItemChecklistHalal @relation(fields: [itemChecklistId], references: [id])
  
  isChecked                  Boolean  @default(false) // Apakah item ini sudah dicek
  catatan                    String?  // Catatan tambahan dari RPH
  
  checkedBy                  String?  // User ID yang melakukan checklist
  checkedAt                  DateTime? // Waktu pengecekan
  
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
  
  @@unique([transaksiPenyembelihanId, itemChecklistId])
}
```

---

## Workflow Checklist

### 1. Regulator Creates Master Checklist
- Regulator login dan akses halaman "Checklist Halal"
- Membuat pertanyaan-pertanyaan checklist untuk PRA dan PASCA penyembelihan
- Mengelompokkan dengan kategori dan urutan tampilan
- Checklist master ini akan digunakan untuk semua transaksi penyembelihan

### 2. RPH Uses Checklist During Slaughter Process

#### Pra-Penyembelihan:
1. Jagal mendaftarkan sapi ke RPH
2. RPH menerima pendaftaran (status: `PENDING_RPH` → `CHECKLIST_PRA`)
3. RPH mengisi semua checklist PRA_PENYEMBELIHAN
4. Semua item harus checked untuk melanjutkan (status: `CHECKLIST_PRA` → `READY_TO_SLAUGHTER`)

#### Pasca-Penyembelihan:
1. RPH selesai penyembelihan (status: `SLAUGHTERING` → `CHECKLIST_PASCA`)
2. RPH mengisi semua checklist PASCA_PENYEMBELIHAN
3. Semua item harus checked untuk melanjutkan (status: `CHECKLIST_PASCA` → `PENDING_INPUT_HASIL`)
4. RPH input berat daging, jeroan, tulang
5. Menunggu verifikasi Jagal dan Regulator

---

## Error Codes

### 400 - Bad Request
```json
{
  "error": "Tipe checklist harus PRA_PENYEMBELIHAN atau PASCA_PENYEMBELIHAN"
}
```

### 404 - Not Found
```json
{
  "error": "Profil Regulator tidak ditemukan"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Testing Guide

### 1. Test Create Checklist
```bash
curl -X POST http://localhost:3000/transaksiPenyembelihan/checklist-halal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pertanyaan": "Apakah hewan dalam kondisi sehat?",
    "tipe": "PRA_PENYEMBELIHAN",
    "kategori": "Kesehatan",
    "urutan": 1
  }'
```

### 2. Test Get All Checklist
```bash
curl -X GET http://localhost:3000/transaksiPenyembelihan/checklist-halal \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Update Checklist
```bash
curl -X PUT http://localhost:3000/transaksiPenyembelihan/checklist-halal/ITEM_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pertanyaan": "Apakah hewan dalam kondisi sehat dan tidak sakit?",
    "tipe": "PRA_PENYEMBELIHAN",
    "kategori": "Kesehatan Hewan",
    "urutan": 1,
    "isAktif": true
  }'
```

### 4. Test Delete Checklist
```bash
curl -X DELETE http://localhost:3000/transaksiPenyembelihan/checklist-halal/ITEM_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Migration Steps

Setelah update schema, jalankan migration:

```bash
cd BACKEND
npx prisma migrate dev --name add-checklist-halal-regulator-relation
npx prisma generate
```

---

## Related Documentation

- [Transaksi Penyembelihan API](./TRANSAKSI_PENYEMBELIHAN_API_NEW.md)
- [RPH Checklist Implementation](./RPH_TRANSAKSI_PENYEMBELIHAN_IMPLEMENTATION.md)
- [Frontend Integration Guide](./FRONTEND_BACKEND_INTEGRATION.md)
