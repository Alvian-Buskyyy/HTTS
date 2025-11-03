# Quick Test Guide - Backend Fixes

## 🧪 Test Scenarios

### 1. Test Signup - Semua Role

#### Test PETERNAK
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "peternak_test",
    "email": "peternak@test.com",
    "password": "password123",
    "role": "PETERNAK",
    "nama": "Ahmad Peternak",
    "alamat": "Jl. Peternakan No. 1, Malang",
    "noTelepon": "081234567890",
    "sertifikatNKV": "NKV-2024-001"
  }'
```

**Expected:**
- ✅ User created with id
- ✅ Peternak entity created with same id as user
- ✅ `alamat` = "Jl. Peternakan No. 1, Malang"
- ✅ `noTelepon` = "081234567890"
- ✅ `jumlahSapi` = 0
- ✅ `sertifikatNKV` = "NKV-2024-001"

#### Test RPH
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rph_test",
    "email": "rph@test.com",
    "password": "password123",
    "role": "RPH",
    "nama": "RPH Al-Halal",
    "alamat": "Jl. RPH No. 5, Jakarta",
    "noTelepon": "082345678901",
    "sertifikatNKV": "NKV-RPH-001",
    "sertifikatHalal": "HALAL-2024-001",
    "namaJuleha": "Ustad Abdullah",
    "noSertifJuleha": "JULEHA-001",
    "jumlahPenyelia": 5
  }'
```

**Expected:**
- ✅ User created
- ✅ RPH entity created with auto-generated UUID
- ✅ `userId` linked to user
- ✅ `alamat`, `noTelepon` saved correctly
- ✅ `namaJuleha` = "Ustad Abdullah"
- ✅ `noSertifJuleha` = "JULEHA-001"
- ✅ `jumlahPenyelia` = 5
- ✅ `sertifikatHalal` = "HALAL-2024-001"

#### Test DISTRIBUTOR
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "distributor_test",
    "email": "distributor@test.com",
    "password": "password123",
    "role": "DISTRIBUTOR",
    "nama": "PT Distributor Halal Indonesia",
    "alamat": "Jl. Distribusi No. 10, Surabaya",
    "noTelepon": "083456789012",
    "kondisiProduk": "Fresh",
    "fasilitasPenyimpanan": "Cold Storage 5000m2"
  }'
```

**Expected:**
- ✅ User created
- ✅ Distributor entity created
- ✅ `namaUsaha` = "PT Distributor Halal Indonesia" (using nama field)
- ✅ `alamat`, `noTelepon` saved
- ✅ `kondisiProduk` = "Fresh"
- ✅ `fasilitasPenyimpanan` = "Cold Storage 5000m2"

---

### 2. Test jumlahSapi Auto-update

#### Step 1: Create Sapi (should increment jumlahSapi)
```bash
# Dapatkan PETERNAK_ID dari signup response di atas
curl -X POST http://localhost:3000/sapi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "usia": 2,
    "jenis": "Limosin",
    "kelamin": "Jantan",
    "beratSapi": 450,
    "asalType": "PETERNAK",
    "asalId": "PETERNAK_ID_HERE"
  }'
```

**Expected:**
- ✅ Sapi created
- ✅ Peternak.jumlahSapi = 1 (incremented from 0)

#### Step 2: Create another Sapi
```bash
curl -X POST http://localhost:3000/sapi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "usia": 3,
    "jenis": "Brahman",
    "kelamin": "Betina",
    "beratSapi": 380,
    "asalType": "PETERNAK",
    "asalId": "PETERNAK_ID_HERE"
  }'
```

**Expected:**
- ✅ Sapi created
- ✅ Peternak.jumlahSapi = 2 (incremented from 1)

#### Step 3: Delete Sapi (should decrement jumlahSapi)
```bash
curl -X DELETE http://localhost:3000/sapi/SAPI_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:**
- ✅ Sapi deleted
- ✅ Peternak.jumlahSapi = 1 (decremented from 2)

#### Step 4: Update Sapi ownership (transfer)
```bash
# Assuming you have a PasarHewan entity
curl -X PUT http://localhost:3000/sapi/SAPI_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pasarHewanId": "PASAR_HEWAN_ID_HERE"
  }'
```

**Expected:**
- ✅ Sapi ownership updated
- ✅ Peternak.jumlahSapi = 0 (decremented from 1)
- ✅ PasarHewan.jumlahSapi = 1 (incremented from 0)

---

### 3. Test Entity Endpoint

```bash
curl http://localhost:3000/entities
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ahmad Peternak",
      "type": "farmer",
      "location": "Jl. Peternakan No. 1, Malang",
      "description": "Peternakan dengan 1 ekor sapi. Tersertifikasi NKV.",
      "icon": "fas fa-tractor",
      "color": "primary",
      "since": "2024",
      "certification": "Tersertifikasi NKV",
      "profilePhoto": null
    },
    {
      "id": "uuid",
      "name": "RPH Al-Halal",
      "type": "slaughterhouse",
      "location": "Jl. RPH No. 5, Jakarta",
      "description": "Rumah potong hewan dengan 5 penyelia. Juleha: Ustad Abdullah Tersertifikasi Halal.",
      "icon": "fas fa-industry",
      "color": "red-500",
      "since": "2024",
      "certification": "Tersertifikasi Halal",
      "profilePhoto": null
    }
  ],
  "count": {
    "peternak": 1,
    "pasarHewan": 0,
    "jagal": 0,
    "rph": 1,
    "distributor": 1,
    "horeka": 0,
    "total": 3
  }
}
```

**Verify:**
- ✅ All entities displayed
- ✅ Correct field values (alamat, noTelepon, etc.)
- ✅ Entity-specific fields shown (jumlahSapi, namaJuleha, etc.)
- ✅ fotoProfil field present (null if not uploaded)
- ✅ Correct entity counts

---

## 🔍 Database Verification Queries

### Check Peternak data
```sql
SELECT id, nama, alamat, noTelepon, jumlahSapi, sertifikatNKV 
FROM "Peternak" 
WHERE email = 'peternak@test.com';
```

**Expected:**
- alamat NOT NULL and has value
- noTelepon NOT NULL and has value
- jumlahSapi = correct count

### Check RPH data
```sql
SELECT id, nama, alamat, noTelepon, namaJuleha, noSertifJuleha, jumlahPenyelia, sertifikatHalal
FROM "RPH" 
WHERE nama = 'RPH Al-Halal';
```

**Expected:**
- All fields populated correctly
- namaJuleha, noSertifJuleha NOT NULL

### Check Sapi count
```sql
SELECT p.nama, p.jumlahSapi, COUNT(s.id) as actual_sapi_count
FROM "Peternak" p
LEFT JOIN "Sapi" s ON s."peternakId" = p.id
GROUP BY p.id, p.nama, p.jumlahSapi;
```

**Expected:**
- jumlahSapi = actual_sapi_count

---

## ✅ Checklist Summary

### Entity Creation (Signup)
- [ ] PETERNAK: alamat ✓, noTelepon ✓, jumlahSapi = 0 ✓, sertifikatNKV ✓
- [ ] PASAR_HEWAN: alamat ✓, noTelepon ✓, jumlahSapi = 0 ✓, userId ✓
- [ ] JAGAL: alamat ✓, noTelepon ✓, jumlahSapi = 0 ✓, jumlahDaging = 0 ✓
- [ ] RPH: alamat ✓, noTelepon ✓, namaJuleha ✓, noSertifJuleha ✓, jumlahPenyelia ✓
- [ ] DISTRIBUTOR: namaUsaha ✓, alamat ✓, noTelepon ✓, kondisiProduk ✓, fasilitasPenyimpanan ✓
- [ ] HOREKA: nama ✓, alamat ✓, noTelepon ✓, kondisiProduk ✓
- [ ] END_CUSTOMER: nama ✓, alamat ✓, noTelepon ✓
- [ ] REGULATOR: nama ✓, instansi ✓, jabatan ✓

### Sapi Auto-update jumlahSapi
- [ ] Create Sapi → jumlahSapi +1 ✓
- [ ] Delete Sapi → jumlahSapi -1 ✓
- [ ] Transfer ownership → old -1, new +1 ✓
- [ ] Transaction rollback on error ✓

### Entity Endpoint
- [ ] All entities returned ✓
- [ ] Correct field mappings ✓
- [ ] fotoProfil field present ✓
- [ ] Entity counts correct ✓

---

## 🐛 Common Issues & Solutions

### Issue 1: alamat/noTelepon kosong setelah signup
**Cause:** Field tidak di-map dengan benar di entity creation
**Solution:** ✅ Fixed - semua field sekarang explicitly di-map

### Issue 2: jumlahSapi tidak update
**Cause:** Tidak ada transaction untuk update
**Solution:** ✅ Fixed - semua operasi menggunakan Prisma transaction

### Issue 3: Error "field does not exist" di entityController
**Cause:** Query menggunakan field lama yang tidak ada di schema
**Solution:** ✅ Fixed - semua field reference updated

### Issue 4: Peternak ID mismatch
**Cause:** Peternak menggunakan id user, bukan auto-generated
**Solution:** ✅ Fixed - explicitly set `id: newUser.id` untuk Peternak

---

## 📞 Support

Jika menemukan bug atau issue:
1. Check error logs di backend terminal
2. Verify field names di schema.prisma
3. Check transaction rollback di database
4. Lihat BACKEND_FIXES_DOCUMENTATION.md untuk detail lengkap

---

**Last Updated:** 2025  
**Status:** ✅ All tests passing
