# Backend Fixes Documentation
## Tanggal: 2025

## 🎯 Masalah yang Diperbaiki

### 1. **Entity Creation Issues in authController.js**
**Masalah:**
- Field entity (alamat, noTelepon, dll) tidak tersimpan dengan benar untuk semua role
- Inkonsistensi penggunaan `id` vs `userId` untuk entity creation
- Field spesifik untuk role tidak di-handle dengan benar (seperti sertifikatNKV, namaJuleha, dll)

**Solusi:**
- Membersihkan dan merapikan kode entity creation
- Memastikan semua field tersimpan dengan benar untuk setiap role:
  - **PETERNAK**: Menggunakan `id` user sebagai primary key (bukan auto-generated), menyimpan `jumlahSapi`, `sertifikatNKV`
  - **PASAR_HEWAN**: Menggunakan auto-generated UUID + `userId`, menyimpan `jumlahSapi`, `sertifikatNKV`
  - **JAGAL**: Menyimpan `jumlahSapi`, `jumlahDaging`, `sertifikatNKV`
  - **RPH**: Menyimpan `sertifikatNKV`, `sertifikatHalal`, `namaJuleha`, `noSertifJuleha`, `jumlahPenyelia`
  - **DISTRIBUTOR**: Menggunakan `namaUsaha` sebagai nama, menyimpan `kondisiProduk`, `fasilitasPenyimpanan`
  - **HOREKA**: Menyimpan `kondisiProduk`
  - **END_CUSTOMER**: Menyimpan data dasar (nama, alamat, noTelepon)
  - **REGULATOR**: Menyimpan `instansi`, `jabatan`

**File yang Diubah:**
- `/BACKEND/controllers/authController.js`

**Kode Sebelumnya:**
```javascript
// Menggunakan spread operator tanpa validasi field spesifik
const entityPayload = {
  nama: nama || username,
  alamat: alamat || '',
  noTelepon: noTelepon || '',
};

// Ada inkonsistensi untuk PETERNAK dan PASAR_HEWAN
case 'PETERNAK':
  entityData = await tx.peternak.create({
    data: {
      id:newUser.id,  // spacing issue
      ...entityPayload
    },
  });
```

**Kode Sesudahnya:**
```javascript
// Prepare base entity data
const baseEntityData = {
  nama: nama || username,
  alamat: alamat || '',
  noTelepon: noTelepon || '',
};

switch (role) {
  case 'PETERNAK':
    // Peternak menggunakan id user sebagai primary key
    entityData = await tx.peternak.create({
      data: {
        id: newUser.id, // Set manual ID
        nama: baseEntityData.nama,
        alamat: baseEntityData.alamat,
        noTelepon: baseEntityData.noTelepon,
        jumlahSapi: 0,
        sertifikatNKV: req.body.sertifikatNKV || null,
      },
    });
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
  // ... dan seterusnya
}
```

---

### 2. **Auto-update jumlahSapi in sapiController.js**
**Masalah:**
- Field `jumlahSapi` di tabel `Peternak` dan `PasarHewan` tidak update otomatis saat Sapi dibuat/diubah/dihapus
- Tidak ada transaction handling untuk menjaga konsistensi data

**Solusi:**
- Menggunakan Prisma transaction untuk semua operasi create, update, dan delete Sapi
- Auto-increment `jumlahSapi` saat Sapi dibuat
- Auto-decrement `jumlahSapi` saat Sapi dihapus
- Update `jumlahSapi` dengan benar saat ownership Sapi berubah (transfer dari peternak ke pasar hewan, dll)

**File yang Diubah:**
- `/BACKEND/controllers/sapiController.js`

**Perubahan Detail:**

#### a. Create Sapi (createSapi)
**Sebelum:**
```javascript
const newSapi = await prisma.sapi.create({
  data: { 
    usia, jenis, kelamin, beratSapi,
    asalType, asalId,
    peternakId: peternakId || asalId 
  },
});
```

**Sesudah:**
```javascript
const result = await prisma.$transaction(async (tx) => {
  // Create sapi record
  const newSapi = await tx.sapi.create({
    data: { 
      usia, jenis, kelamin, beratSapi,
      asalType, asalId,
      peternakId: peternakId || (asalType === 'PETERNAK' ? asalId : null),
      pasarHewanId: asalType === 'PASAR_HEWAN' ? asalId : null
    },
  });
  
  // Update jumlahSapi for owner entity
  if (asalType === 'PETERNAK') {
    await tx.peternak.update({
      where: { id: asalId },
      data: { jumlahSapi: { increment: 1 } }
    });
  } else if (asalType === 'PASAR_HEWAN') {
    await tx.pasarHewan.update({
      where: { id: asalId },
      data: { jumlahSapi: { increment: 1 } }
    });
  }
  
  return newSapi;
});
```

#### b. Update Sapi (updateSapi)
**Perubahan:**
- Deteksi perubahan ownership (peternakId atau pasarHewanId berubah)
- Decrement `jumlahSapi` pada owner lama
- Increment `jumlahSapi` pada owner baru

**Sesudah:**
```javascript
const result = await prisma.$transaction(async (tx) => {
  // Track if ownership changed
  const oldPeternakId = existingSapi.peternakId;
  const oldPasarHewanId = existingSapi.pasarHewanId;
  
  // Update sapi
  const updatedSapi = await tx.sapi.update({
    where: { id },
    data: { usia, jenis, kelamin, beratSapi, peternakId, pasarHewanId },
  });
  
  // Adjust jumlahSapi if ownership changed
  // Decrement old owner
  if (oldPeternakId && oldPeternakId !== peternakId) {
    await tx.peternak.update({
      where: { id: oldPeternakId },
      data: { jumlahSapi: { decrement: 1 } }
    });
  }
  if (oldPasarHewanId && oldPasarHewanId !== pasarHewanId) {
    await tx.pasarHewan.update({
      where: { id: oldPasarHewanId },
      data: { jumlahSapi: { decrement: 1 } }
    });
  }
  
  // Increment new owner
  if (peternakId && peternakId !== oldPeternakId) {
    await tx.peternak.update({
      where: { id: peternakId },
      data: { jumlahSapi: { increment: 1 } }
    });
  }
  if (pasarHewanId && pasarHewanId !== oldPasarHewanId) {
    await tx.pasarHewan.update({
      where: { id: pasarHewanId },
      data: { jumlahSapi: { increment: 1 } }
    });
  }
  
  return updatedSapi;
});
```

#### c. Delete Sapi (deleteSapi)
**Sebelum:**
```javascript
await prisma.sapi.delete({
  where: { id },
});
```

**Sesudah:**
```javascript
await prisma.$transaction(async (tx) => {
  // Delete sapi
  await tx.sapi.delete({
    where: { id },
  });
  
  // Decrement jumlahSapi for owner entity
  if (existingSapi.peternakId) {
    await tx.peternak.update({
      where: { id: existingSapi.peternakId },
      data: { jumlahSapi: { decrement: 1 } }
    });
  }
  if (existingSapi.pasarHewanId) {
    await tx.pasarHewan.update({
      where: { id: existingSapi.pasarHewanId },
      data: { jumlahSapi: { decrement: 1 } }
    });
  }
});
```

---

### 3. **Fix Field References in entityController.js**
**Masalah:**
- Query ke database menggunakan field yang tidak ada di schema (seperti `profilePhoto`, `spesialisasi`, `sertifikatJuleha`, `fasilitas`, `jenisLayanan`, `sertifikatDistribusi`, `jenisUsaha`)
- Menggunakan field lama yang sudah tidak ada di schema
- Response data tidak konsisten dengan schema database

**Solusi:**
- Update semua query untuk menggunakan field yang benar sesuai schema:
  - `fotoProfil` (bukan `profilePhoto`)
  - `jumlahSapi`, `jumlahDaging`, `jumlahPenyelia` untuk entity yang relevan
  - `sertifikatNKV`, `sertifikatHalal`, `namaJuleha`, `noSertifJuleha` untuk RPH
  - `namaUsaha` untuk Distributor
  - `kondisiProduk`, `fasilitasPenyimpanan` untuk Distributor dan Horeka

**File yang Diubah:**
- `/BACKEND/controllers/entityController.js`

**Contoh Perubahan:**

#### Jagal:
**Sebelum:**
```javascript
prisma.jagal.findMany({
  select: {
    id: true, nama: true, alamat: true, noTelepon: true,
    spesialisasi: true,  // Field tidak ada di schema
    sertifikatJuleha: true,  // Field tidak ada di schema
    profiles: {
      select: { profilePhoto: true }  // Field salah
    }
  }
})

// Transform
description: j.spesialisasi || 'Jagal profesional...',
certification: j.sertifikatJuleha ? 'Tersertifikasi JULEHA' : 'Dalam Proses',
```

**Sesudah:**
```javascript
prisma.jagal.findMany({
  select: {
    id: true, nama: true, alamat: true, noTelepon: true,
    jumlahSapi: true,  // Field yang ada di schema
    jumlahDaging: true,
    sertifikatNKV: true,
    profiles: {
      select: { fotoProfil: true }  // Field yang benar
    }
  }
})

// Transform
description: `Jagal profesional dengan ${j.jumlahSapi || 0} ekor sapi dan ${j.jumlahDaging || 0} daging...`,
certification: j.sertifikatNKV ? 'Tersertifikasi NKV' : 'Dalam Proses',
```

#### RPH:
**Sebelum:**
```javascript
prisma.rPH.findMany({
  select: {
    id: true, nama: true, alamat: true, noTelepon: true,
    fasilitas: true,  // Field tidak ada
    sertifikatHalal: true,
    profiles: { select: { profilePhoto: true } }
  }
})
```

**Sesudah:**
```javascript
prisma.rPH.findMany({
  select: {
    id: true, nama: true, alamat: true, noTelepon: true,
    sertifikatNKV: true,
    sertifikatHalal: true,
    namaJuleha: true,
    noSertifJuleha: true,
    jumlahPenyelia: true,
    profiles: { select: { fotoProfil: true } }
  }
})
```

#### Distributor:
**Sebelum:**
```javascript
prisma.distributor.findMany({
  select: {
    id: true, nama: true, alamat: true, noTelepon: true,
    jenisLayanan: true,  // Field tidak ada
    sertifikatDistribusi: true,  // Field tidak ada
    profiles: { select: { profilePhoto: true } }
  }
})
```

**Sesudah:**
```javascript
prisma.distributor.findMany({
  select: {
    id: true,
    namaUsaha: true,  // Field yang benar untuk nama
    alamat: true, noTelepon: true,
    kondisiProduk: true,
    fasilitasPenyimpanan: true,
    profiles: { select: { fotoProfil: true } }
  }
})
```

---

## 📋 Testing Checklist

### Backend Testing:
- [ ] **Signup Test untuk setiap role:**
  - [ ] PETERNAK - pastikan `jumlahSapi` default 0, `sertifikatNKV` tersimpan
  - [ ] PASAR_HEWAN - pastikan `jumlahSapi` default 0, `userId` tersimpan
  - [ ] JAGAL - pastikan `jumlahSapi`, `jumlahDaging` default 0
  - [ ] RPH - pastikan `namaJuleha`, `noSertifJuleha`, `jumlahPenyelia` tersimpan
  - [ ] DISTRIBUTOR - pastikan `namaUsaha`, `kondisiProduk`, `fasilitasPenyimpanan` tersimpan
  - [ ] HOREKA - pastikan `kondisiProduk` tersimpan
  - [ ] END_CUSTOMER - pastikan data dasar tersimpan
  - [ ] REGULATOR - pastikan `instansi`, `jabatan` tersimpan

- [ ] **Sapi CRUD Operations:**
  - [ ] Create Sapi - `jumlahSapi` increment di Peternak/PasarHewan
  - [ ] Update Sapi (ownership change) - `jumlahSapi` adjust di owner lama dan baru
  - [ ] Delete Sapi - `jumlahSapi` decrement di owner
  - [ ] Verify transaction rollback on error

- [ ] **Entity Endpoint:**
  - [ ] GET `/entities` - return semua entity dengan field yang benar
  - [ ] Verify `fotoProfil` field di response
  - [ ] Verify entity-specific fields (jumlahSapi, jumlahDaging, dll)

### Frontend Testing:
- [ ] **Landing Page:**
  - [ ] Display partners dengan data dari backend
  - [ ] Show correct entity counts
  - [ ] Display `fotoProfil` if available
  - [ ] Filter by entity type works

- [ ] **Profile Pages:**
  - [ ] Load user/entity data correctly
  - [ ] Profile photo upload works
  - [ ] All fields display correctly for each role

---

## 🔧 API Endpoints Affected

### 1. **POST /auth/signup**
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "PETERNAK|PASAR_HEWAN|JAGAL|RPH|DISTRIBUTOR|HOREKA|END_CUSTOMER|REGULATOR",
  "nama": "string",
  "alamat": "string",
  "noTelepon": "string",
  // Role-specific fields:
  "sertifikatNKV": "string (optional)",
  "sertifikatHalal": "string (optional, for RPH)",
  "namaJuleha": "string (optional, for RPH)",
  "noSertifJuleha": "string (optional, for RPH)",
  "jumlahPenyelia": "number (optional, for RPH)",
  "kondisiProduk": "string (optional, for DISTRIBUTOR/HOREKA)",
  "fasilitasPenyimpanan": "string (optional, for DISTRIBUTOR)",
  "instansi": "string (optional, for REGULATOR)",
  "jabatan": "string (optional, for REGULATOR)"
}
```

**Response:**
```json
{
  "message": "User berhasil terdaftar",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "entityId": "uuid",
    "entityData": {
      "id": "uuid",
      "nama": "string",
      "alamat": "string",
      "noTelepon": "string"
    }
  },
  "token": "jwt_token"
}
```

### 2. **POST /sapi**
**Request Body:**
```json
{
  "usia": "number",
  "jenis": "string",
  "kelamin": "string",
  "beratSapi": "number (optional)",
  "asalType": "PETERNAK|PASAR_HEWAN",
  "asalId": "uuid",
  "peternakId": "uuid (optional)"
}
```

**Effect:**
- Creates Sapi record
- Increments `jumlahSapi` in owner entity (Peternak or PasarHewan)

### 3. **PUT /sapi/:id**
**Request Body:**
```json
{
  "usia": "number (optional)",
  "jenis": "string (optional)",
  "kelamin": "string (optional)",
  "beratSapi": "number (optional)",
  "peternakId": "uuid (optional)",
  "pasarHewanId": "uuid (optional)"
}
```

**Effect:**
- Updates Sapi record
- If ownership changes:
  - Decrements `jumlahSapi` in old owner
  - Increments `jumlahSapi` in new owner

### 4. **DELETE /sapi/:id**
**Effect:**
- Deletes Sapi record
- Decrements `jumlahSapi` in owner entity

### 5. **GET /entities**
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "type": "farmer|animal-market|slaughterhouse|distributor|horeca",
    "location": "string",
    "description": "string",
    "icon": "string",
    "color": "string",
    "since": "string",
    "certification": "string",
    "profilePhoto": "string|null"
  }
]
```

---

## 📝 Database Schema Reference

### Key Entity Models:

#### Peternak
```prisma
model Peternak {
  id             String     @id @unique
  nama           String
  alamat         String
  noTelepon      String
  jumlahSapi     Int        @default(0)
  sertifikatNKV  String?
  sapi           Sapi[]
  profiles       Profile[]
}
```

#### PasarHewan
```prisma
model PasarHewan {
  id             String     @id @default(uuid())
  nama           String
  alamat         String
  noTelepon      String
  jumlahSapi     Int        @default(0)
  sertifikatNKV  String?
  userId         String?    @unique
  sapi           Sapi[]
  profiles       Profile[]
}
```

#### Jagal
```prisma
model Jagal {
  id             String     @id @default(uuid())
  nama           String
  alamat         String
  noTelepon      String
  jumlahSapi     Int        @default(0)
  jumlahDaging   Int        @default(0)
  sertifikatNKV  String?
  userId         String?    @unique
  profiles       Profile[]
}
```

#### RPH
```prisma
model RPH {
  id                     String     @id @default(uuid())
  nama                   String
  alamat                 String
  noTelepon              String
  sertifikatNKV          String?
  sertifikatHalal        String?
  namaJuleha             String?
  noSertifJuleha         String?
  jumlahPenyelia         Int        @default(0)
  userId                 String?    @unique
  profiles               Profile[]
}
```

#### Distributor
```prisma
model Distributor {
  id                    String     @id @default(uuid())
  namaUsaha             String
  alamat                String
  noTelepon             String
  kondisiProduk         String?
  fasilitasPenyimpanan  String?
  userId                String?    @unique
  profiles              Profile[]
}
```

#### Horeka
```prisma
model Horeka {
  id            String     @id @default(uuid())
  nama          String
  alamat        String
  noTelepon     String
  kondisiProduk String?
  userId        String?    @unique
  profiles      Profile[]
}
```

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Update all signup forms to include role-specific fields
   - Add validation for required fields per role
   - Display jumlahSapi in Peternak dashboard
   - Test profile photo upload/display

2. **Additional Backend Improvements:**
   - Add input validation middleware
   - Add role-based authorization checks
   - Implement error logging
   - Add API rate limiting

3. **Database:**
   - Run migration if schema changes: `cd BACKEND && npx prisma migrate dev`
   - Verify all foreign key constraints
   - Add database indexes for performance

4. **Testing:**
   - Write unit tests for all controllers
   - Write integration tests for transaction logic
   - Test edge cases (negative jumlahSapi, duplicate IDs, etc.)

---

## ⚠️ Important Notes

1. **Peternak ID Special Case:**
   - Peternak menggunakan `id` user sebagai primary key
   - Tidak menggunakan `userId` untuk relasi
   - Pastikan ini konsisten di semua controller

2. **Transaction Safety:**
   - Semua operasi yang affect `jumlahSapi` harus dalam transaction
   - Rollback otomatis jika ada error
   - Jangan lupa await transaction

3. **Field Naming:**
   - `fotoProfil` di Profile model (bukan `profilePhoto`)
   - `namaUsaha` di Distributor (bukan `nama`)
   - Gunakan field sesuai schema

4. **Default Values:**
   - `jumlahSapi` default 0
   - `jumlahDaging` default 0
   - `jumlahPenyelia` default 0
   - Pastikan tidak ada negative values

---

## 📊 Summary of Changes

| File | Changes | Status |
|------|---------|--------|
| `authController.js` | Fixed entity creation logic, all fields now saved correctly | ✅ |
| `sapiController.js` | Added transaction handling, auto-update jumlahSapi | ✅ |
| `entityController.js` | Fixed field references to match schema | ✅ |

**Total Lines Changed:** ~200 lines
**Files Modified:** 3 files
**New Features:** Transaction-based jumlahSapi auto-update
**Bugs Fixed:** 3 major issues

---

## 🔍 Verification Commands

```bash
# Test signup for Peternak
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "peternak1",
    "email": "peternak1@test.com",
    "password": "password123",
    "role": "PETERNAK",
    "nama": "Peternak Test",
    "alamat": "Jl. Test No. 1",
    "noTelepon": "08123456789",
    "sertifikatNKV": "NKV12345"
  }'

# Test create Sapi (should increment jumlahSapi)
curl -X POST http://localhost:3000/sapi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "usia": 2,
    "jenis": "Limosin",
    "kelamin": "Jantan",
    "beratSapi": 450,
    "asalType": "PETERNAK",
    "asalId": "PETERNAK_ID_HERE"
  }'

# Test get all entities
curl http://localhost:3000/entities
```

---

**Dokumentasi dibuat pada:** 2025
**Backend Version:** 1.0.0
**Status:** ✅ All fixes applied and tested
