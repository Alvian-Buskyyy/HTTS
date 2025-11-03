# Update Halaman Profil Peternak dengan Integrasi Backend

## Perubahan Backend

### 1. `/BACKEND/controllers/peternakController.js`
Ditambahkan endpoint baru:
- `getPeternakByUserId` - Mengambil data peternak berdasarkan userId dengan include User dan Profile
- `updatePeternakByUserId` - Update data peternak berdasarkan userId (bukan peternakId)

### 2. `/BACKEND/controllers/userController.js`
Ditambahkan endpoint baru:
- `getUserProfile` - Mengambil data user lengkap dengan profile dan semua entitas terkait (peternak, jagal, rph, dll)
- `updateProfilePhoto` - Upload/update foto profil user ke tabel Profile

### 3. `/BACKEND/routes/peternakRoutes.js`
Ditambahkan route baru:
- `GET /peternak/user/:userId` - Get peternak by userId
- `PUT /peternak/user/:userId` - Update peternak by userId

### 4. `/BACKEND/routes/userRoutes.js`
Ditambahkan route baru:
- `GET /users/:id/profile` - Get user profile lengkap dengan semua entitas
- `PUT /users/:userId/profile-photo` - Upload foto profil

## Perubahan Frontend

### `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakProfil.jsx`
Dibuat ulang dengan fitur lengkap:

#### Fitur Upload Foto Profil:
- Input file tersembunyi dengan tombol kamera icon
- Validasi tipe file (JPEG, JPG, PNG, GIF)
- Validasi ukuran file (max 5MB)
- Convert ke base64 dan preview langsung
- Upload otomatis ke backend saat foto dipilih
- Loading indicator saat upload
- Success notification setelah upload

#### Fitur Load Data User:
- Fetch data user dari endpoint `/users/:id/profile`
- Menampilkan data peternak (nama, alamat, no telepon, jumlah sapi, sertifikat NKV)
- Menampilkan foto profil dari tabel Profile
- Menampilkan role badge dan tanggal bergabung

#### Fitur Edit Profil:
- Toggle mode edit/view
- Form edit dengan semua field peternak:
  - Nama Lengkap (required)
  - Nomor Telepon (required)
  - Alamat (required)
  - Jumlah Sapi
  - Sertifikat NKV
- Tombol Batal untuk reset form
- Tombol Simpan dengan loading state
- Update ke backend menggunakan endpoint `/peternak/user/:userId`
- Update localStorage setelah sukses
- Success/error notification dengan auto-hide

#### UI/UX Improvements:
- Design modern dengan Tailwind CSS
- Icons dari Font Awesome untuk setiap field
- Card layout dengan shadow dan rounded corners
- Grid layout responsive (mobile, tablet, desktop)
- Hover effects pada tombol
- Loading spinner saat fetch/submit data
- Success notification dengan icon check-circle
- Error notification dengan icon exclamation-circle

## Cara Penggunaan

### 1. Jalankan Backend:
```bash
cd BACKEND
bun run app.js
```

### 2. Jalankan Frontend:
```bash
cd FRONTEND/frontend-halal
npm run dev
```

### 3. Test Flow:
1. Login sebagai peternak
2. Navigasi ke halaman Profil
3. Upload foto profil dengan klik icon kamera
4. Klik tombol "Edit Profil" untuk edit data
5. Ubah field yang diperlukan
6. Klik "Simpan Perubahan" untuk update
7. Verifikasi data tersimpan dengan reload halaman

## Endpoint API yang Digunakan

### Get User Profile (dengan semua entitas):
```
GET /users/:userId/profile
Headers: Authorization: Bearer <token>
Response: {
  id, username, email, role, createdAt,
  profile: { profilePhoto },
  peternak: { nama, alamat, noTelepon, jumlahSapi, sertifikatNKV },
  jagal: {...},
  rph: {...},
  ...
}
```

### Update Peternak by UserId:
```
PUT /peternak/user/:userId
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
Body: {
  nama, alamat, noTelepon, jumlahSapi, sertifikatNKV
}
Response: Updated peternak object
```

### Update Profile Photo:
```
PUT /users/:userId/profile-photo
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
Body: {
  profilePhoto: "data:image/png;base64,..."
}
Response: { userId, profilePhoto }
```

## Database Schema yang Terlibat

### Tabel User:
- id (String, PK)
- username
- email
- password
- role
- createdAt

### Tabel Peternak:
- id (Int, PK, AutoIncrement)
- userId (String, Unique, FK -> User)
- nama
- alamat
- noTelepon
- jumlahSapi
- sertifikatNKV
- createdAt

### Tabel Profile:
- id (Int, PK, AutoIncrement)
- userId (String, Unique, FK -> User)
- profilePhoto (Text, base64 encoded)
- createdAt
- updatedAt

## Catatan Penting

1. **Relasi userId**: Semua entitas (Peternak, Jagal, RPH, dll) sekarang memiliki field `userId` yang unique dan berelasi ke tabel User
2. **Foto Profil**: Disimpan sebagai base64 di tabel Profile (bukan di entitas)
3. **Token Auth**: Semua endpoint memerlukan Bearer token di header Authorization
4. **localStorage**: Frontend menyimpan user data di localStorage untuk caching
5. **Error Handling**: Backend dan frontend memiliki error handling lengkap dengan pesan yang informatif

## Next Steps

1. Implementasi halaman profil serupa untuk role lain (Jagal, RPH, Distributor, dll)
2. Tambahkan fitur upload sertifikat (file PDF/gambar)
3. Tambahkan validasi input yang lebih ketat (regex untuk telepon, dll)
4. Implementasi change password functionality
5. Tambahkan audit log untuk setiap perubahan profil
6. Implementasi image compression sebelum upload
7. Migrasi foto profil ke cloud storage (AWS S3, Cloudinary, dll) untuk performa lebih baik
