# Landing Page Integration dengan Database

## Perubahan yang Dilakukan

### 1. Backend: `/BACKEND/controllers/entityController.js`

**Endpoint yang Diupdate:**
- `GET /entities` - Mengambil semua entitas yang terdaftar di database

**Data yang Dikembalikan:**
```json
{
  "success": true,
  "message": "Daftar entitas terdaftar berhasil diambil",
  "data": [
    {
      "id": "...",
      "name": "Nama Entitas",
      "type": "farmer|animal-market|slaughterhouse|distributor|horeca",
      "location": "Alamat lengkap",
      "description": "Deskripsi entitas",
      "icon": "fas fa-...",
      "color": "primary|yellow-500|red-500|indigo-500|green-500",
      "since": "2024",
      "certification": "Status sertifikasi",
      "profilePhoto": "base64 atau null",
      "createdAt": "timestamp"
    }
  ],
  "count": {
    "peternak": 0,
    "pasarHewan": 0,
    "jagal": 0,
    "rph": 0,
    "distributor": 0,
    "horeka": 0,
    "total": 0
  }
}
```

**Data yang Diambil dari Setiap Entitas:**

#### Peternak:
- id, nama, alamat, noTelepon
- jumlahSapi
- sertifikatNKV
- profilePhoto (dari tabel Profile)
- createdAt

#### Pasar Hewan:
- id, nama, alamat, noTelepon
- sertifikatNKV
- profilePhoto
- createdAt

#### Jagal:
- id, nama, alamat, noTelepon
- spesialisasi
- sertifikatJuleha
- profilePhoto
- createdAt

#### RPH:
- id, nama, alamat, noTelepon
- fasilitas
- sertifikatHalal
- profilePhoto
- createdAt

#### Distributor:
- id, nama, alamat, noTelepon
- jenisLayanan
- sertifikatDistribusi
- profilePhoto
- createdAt

#### HoReCa:
- id, nama, alamat, noTelepon
- jenisUsaha
- sertifikatHalal
- profilePhoto
- createdAt

---

### 2. Frontend: `/FRONTEND/frontend-halal/src/pages/LandingPage.jsx`

**Perubahan:**

1. **State Management:**
```javascript
const [partners, setPartners] = useState([]);
const [partnersLoading, setPartnersLoading] = useState(true);
const [partnersStats, setPartnersStats] = useState({...});
```

2. **Fetch Data dari Backend:**
```javascript
useEffect(() => {
  const fetchPartners = async () => {
    const response = await fetch('http://localhost:3000/entities');
    const result = await response.json();
    if (result.success) {
      setPartners(result.data);
      setPartnersStats(result.count);
    }
  };
  fetchPartners();
}, []);
```

3. **UI Updates:**
- Loading state dengan spinner
- Empty state jika belum ada data
- Menampilkan jumlah total mitra di heading
- Data mitra sekarang real-time dari database

---

## Fitur yang Ditambahkan

### ✅ Dynamic Partner Display
- Menampilkan entitas yang benar-benar terdaftar di database
- Tidak lagi menggunakan data mock/dummy

### ✅ Loading State
- Spinner animasi saat fetch data
- Pesan "Memuat mitra..."

### ✅ Empty State
- Icon dan pesan jika belum ada mitra terdaftar
- "Belum ada mitra yang terdaftar dalam kategori ini."

### ✅ Real-time Stats
- Menampilkan jumlah total mitra di heading
- "Temui jaringan X bisnis bersertifikat halal..."

### ✅ Filter by Type
- Filter masih bekerja dengan data dari database
- All, Peternak, Pasar Hewan, RPH, Distributor, HoReCa

---

## Mapping Type untuk Filter

**Backend → Frontend:**
- `farmer` → Peternak
- `animal-market` → Pasar Hewan  
- `slaughterhouse` → Rumah Potong Hewan (Jagal & RPH)
- `distributor` → Distributor
- `horeca` → HoReCa

---

## Testing

### 1. Test Endpoint Backend:
```bash
curl http://localhost:3000/entities
```

### 2. Test Frontend:
1. Buka browser ke landing page
2. Scroll ke section "#TemanHalal"
3. Verifikasi:
   - Loading spinner muncul saat fetch
   - Data mitra ditampilkan dari database
   - Filter berfungsi dengan baik
   - Jumlah total mitra benar

### 3. Test dengan Database Kosong:
1. Jika belum ada data di database
2. Akan muncul empty state
3. Pesan: "Belum ada mitra yang terdaftar"

### 4. Test dengan Data Real:
1. Register user dengan role PETERNAK/JAGAL/dll
2. Refresh landing page
3. Mitra baru akan muncul di #TemanHalal section

---

## Next Steps

1. ✅ Tambahkan foto profil di card mitra
2. ✅ Tambahkan link ke detail mitra (modal atau page)
3. ✅ Implementasi pagination jika data banyak
4. ✅ Tambahkan search/filter by location
5. ✅ Cache data untuk performa lebih baik
6. ✅ Add error handling UI yang lebih baik

---

## Benefits

✅ **Real-time Data** - Mitra yang tampil sesuai database  
✅ **No Hardcoded Data** - Semua data dynamic  
✅ **Better UX** - Loading & empty states  
✅ **Scalable** - Support unlimited mitra  
✅ **Accurate Stats** - Jumlah mitra selalu benar  

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities` | Get all registered entities |
| GET | `/entities/:entityType/:entityId` | Get specific entity detail |
| POST | `/entities/validate` | Validate if entity exists |

---

## Backend Running ✅
```
Server is running on port 3000
```

**Landing page sekarang menampilkan data mitra yang sebenarnya dari database!** 🎉
