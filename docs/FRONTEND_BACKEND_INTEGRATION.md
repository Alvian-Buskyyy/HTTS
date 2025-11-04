# Frontend-Backend Integration - Fetch Cattle Data

## 🎯 Overview

Frontend sekarang mengambil data sapi langsung dari backend berdasarkan `peternakId` yang login, bukan dari localStorage.

---

## 📋 Changes Made

### 1. **PeternakSapi.jsx**
**Location:** `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakSapi.jsx`

**Before:**
```javascript
// Get cattle data from localStorage
const storedCattleJSON = localStorage.getItem('cattleList');
const storedCattle = JSON.parse(storedCattleJSON);
```

**After:**
```javascript
// Fetch cattle data from backend based on peternakId
const userData = JSON.parse(localStorage.getItem('userData'));
const peternakId = userData.entityId || userData.id;

const response = await fetch(
  `http://localhost:3000/sapi/entity/PETERNAK/${peternakId}`,
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }
);
```

### 2. **PeternakDashboard.jsx**
**Location:** `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakDashboard.jsx`

**Same Changes:**
- Fetch dari backend API
- Map data sesuai struktur frontend
- Auto-update stats berdasarkan data dari backend

---

## 🔌 API Endpoint Used

### GET `/sapi/entity/PETERNAK/:peternakId`

**Method:** GET  
**Authentication:** Required (Bearer Token)  
**Description:** Mengambil semua sapi yang dimiliki oleh peternak tertentu

**Request:**
```http
GET http://localhost:3000/sapi/entity/PETERNAK/user-uuid-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "sapi-uuid-1",
    "usia": 2,
    "jenis": "Limosin",
    "kelamin": "Jantan",
    "beratSapi": 450,
    "asalType": "PETERNAK",
    "asalId": "user-uuid-here",
    "peternakId": "user-uuid-here",
    "pasarHewanId": null,
    "daging": null,
    "transaksiPenyembelihan": [],
    "transaksiPenjualan": [],
    "pengecekanSehat": [],
    "pengecekanHalalSehat": [],
    "qr": []
  }
]
```

---

## 🔄 Data Mapping

Backend response di-map ke struktur frontend:

```javascript
const mappedData = data.map(cattle => ({
  id: cattle.id,                           // UUID dari backend
  type: cattle.jenis,                      // Jenis sapi
  gender: cattle.kelamin,                  // Jantan/Betina
  birthDate: cattle.tanggalLahir || ...,   // Optional
  weight: parseFloat(cattle.beratSapi),    // Berat dalam kg
  healthStatus: cattle.healthStatus || 'sehat',
  availability: cattle.availability || 'available',
  age: parseFloat(cattle.usia),            // Usia dalam tahun
  asalId: cattle.asalId,                   // ID asal entity
  peternakId: cattle.peternakId,           // ID peternak owner
  pasarHewanId: cattle.pasarHewanId        // ID pasar hewan (jika ada)
}));
```

---

## ✅ Benefits

1. **Real-time Data:** Data selalu up-to-date dari database
2. **Multi-device:** Data konsisten di semua device
3. **Accurate Stats:** jumlahSapi di backend auto-update saat CRUD
4. **Security:** Data tidak bisa dimanipulasi di localStorage
5. **Scalability:** Mudah menambah fitur filter, sort, pagination

---

## 🧪 Testing

### Test 1: Login as Peternak
1. Login ke sistem sebagai Peternak
2. Navigate ke "Inventaris Sapi"
3. **Expected:** Data sapi tampil sesuai dengan database

### Test 2: Create New Sapi
1. Tambah sapi baru melalui form
2. Refresh page
3. **Expected:** Sapi baru muncul di list (fetch dari backend)
4. **Expected:** jumlahSapi di dashboard bertambah 1

### Test 3: Delete Sapi
1. Hapus sapi dari list
2. Refresh page
3. **Expected:** Sapi sudah tidak ada (data dari backend)
4. **Expected:** jumlahSapi di dashboard berkurang 1

### Test 4: Multiple Peternak
1. Login sebagai Peternak A → lihat daftar sapi
2. Logout, login sebagai Peternak B → lihat daftar sapi
3. **Expected:** Setiap peternak hanya melihat sapi miliknya sendiri

---

## 🔒 Authentication Flow

```
1. User login → receive JWT token
2. Token saved to localStorage
3. Frontend requests include token in header
4. Backend verifies token
5. Backend returns data filtered by userId/entityId
```

---

## 📊 Stats Calculation

Stats dihitung dari data yang di-fetch dari backend:

```javascript
const stats = {
  totalSapi: mappedData.length,
  availableForSale: mappedData.filter(
    item => item.availability === 'available'
  ).length,
  inTransaction: mappedData.filter(
    item => item.availability === 'in_transaction'
  ).length,
  needHealthCheck: mappedData.filter(
    item => item.healthStatus === 'perlu_periksa' || 
            item.healthStatus === 'sakit'
  ).length
};
```

---

## 🐛 Error Handling

```javascript
try {
  // Fetch data from backend
  const response = await fetch(...);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  const data = await response.json();
  setCattleData(data);
  
} catch (error) {
  console.error('Error fetching cattle data:', error);
  
  // Set empty state
  setCattleData([]);
  setStats({
    totalSapi: 0,
    availableForSale: 0,
    inTransaction: 0,
    needHealthCheck: 0
  });
} finally {
  setLoading(false);
}
```

---

## 🔮 Next Steps

### Immediate:
- ✅ Fetch data from backend based on peternakId
- ⏳ Implement create Sapi via API
- ⏳ Implement update Sapi via API
- ⏳ Implement delete Sapi via API

### Future Enhancements:
- [ ] Add pagination for large cattle lists
- [ ] Add real-time updates (WebSocket)
- [ ] Add cattle search and advanced filters
- [ ] Add cattle image upload
- [ ] Add cattle health records from backend
- [ ] Add transaction history from backend

---

## 📚 Related Files

### Backend:
- `/BACKEND/controllers/sapiController.js` - CRUD operations
- `/BACKEND/routes/sapiRoutes.js` - API routes
- `/BACKEND/prisma/schema.prisma` - Database schema

### Frontend:
- `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakSapi.jsx`
- `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakDashboard.jsx`

### Documentation:
- `BACKEND_FIXES_DOCUMENTATION.md` - Backend changes
- `QUICK_TEST_GUIDE.md` - Testing guide
- `FIXES_SUMMARY.md` - Summary of fixes

---

**Last Updated:** 2025  
**Status:** ✅ Fetch from backend implemented  
**Next:** Implement Create/Update/Delete via API
