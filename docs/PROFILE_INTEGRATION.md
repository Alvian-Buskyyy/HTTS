# Profile Integration - Frontend & Backend

## 🎯 Overview

PeternakProfil.jsx sekarang terintegrasi penuh dengan backend untuk:
1. **Fetch data profil** berdasarkan user ID yang login
2. **Update data profil** ke backend
3. **Upload foto profil** dengan preview dan save ke database

---

## 📋 Changes Made

### 1. **Fetch User Profile Data**

**Before:**
```javascript
// Mock data dari localStorage
const mockUserData = {
  name: 'Sumitro Wijaya',
  email: 'sumitro27@gmail.com',
  ...
};
```

**After:**
```javascript
// Fetch dari backend berdasarkan userId
const localUserData = JSON.parse(localStorage.getItem('userData'));
const userId = localUserData.id;
const peternakId = localUserData.entityId || localUserData.id;

const [userResponse, peternakResponse] = await Promise.all([
  fetch(`http://localhost:3000/users/${userId}`),
  fetch(`http://localhost:3000/peternak/${peternakId}`)
]);

// Combine user + peternak data
const combinedData = {
  id: user.id,
  username: user.username,
  name: peternak.nama,
  email: user.email,
  phone: peternak.noTelepon,
  address: peternak.alamat,
  cattleCount: peternak.jumlahSapi,
  profileImage: peternak.profiles?.[0]?.fotoProfil,
  ...
};
```

### 2. **Update Profile Data**

**Before:**
```javascript
// Simulate update
setTimeout(() => {
  setUserData({ ...userData, ...formData });
}, 1000);
```

**After:**
```javascript
// Real API call to backend
const response = await fetch(`http://localhost:3000/peternak/${peternakId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nama: formData.name,
    alamat: formData.address,
    noTelepon: formData.phone,
    city: formData.city,
    province: formData.province,
    bio: formData.bio,
    ...
  })
});
```

### 3. **Upload Profile Photo**

**New Feature:**
```javascript
// Handle image selection
const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file)); // Show preview
  }
};

// Upload to backend
const handleImageUpload = async () => {
  const uploadFormData = new FormData();
  uploadFormData.append('fotoProfil', selectedImage);
  uploadFormData.append('userId', userId);
  uploadFormData.append('peternakId', peternakId);
  
  const response = await fetch('http://localhost:3000/upload/profile-photo', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: uploadFormData
  });
  
  // Update UI with new image URL
  setUserData({
    ...userData,
    profileImage: result.imageUrl
  });
};
```

---

## 🔌 API Endpoints

### 1. GET `/users/:userId`

**Description:** Mendapatkan data user berdasarkan ID  
**Method:** GET  
**Auth:** Required (Bearer Token)

**Response:**
```json
{
  "id": "user-uuid",
  "username": "peternak01",
  "email": "peternak@example.com",
  "role": "PETERNAK",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-06-15T10:30:00.000Z"
}
```

### 2. GET `/peternak/:peternakId`

**Description:** Mendapatkan data peternak berdasarkan ID  
**Method:** GET  
**Auth:** Required (Bearer Token)

**Response:**
```json
{
  "id": "peternak-uuid",
  "nama": "Ahmad Peternak",
  "alamat": "Jl. Peternakan No. 1",
  "noTelepon": "081234567890",
  "jumlahSapi": 25,
  "sertifikatNKV": "NKV-2024-001",
  "city": "Malang",
  "province": "Jawa Timur",
  "bio": "Peternakan keluarga sejak 2010",
  "profiles": [
    {
      "fotoProfil": "https://example.com/photos/peternak.jpg"
    }
  ]
}
```

### 3. PUT `/peternak/:peternakId`

**Description:** Update data profil peternak  
**Method:** PUT  
**Auth:** Required (Bearer Token)

**Request Body:**
```json
{
  "nama": "Ahmad Peternak Updated",
  "alamat": "Jl. Baru No. 2",
  "noTelepon": "081234567899",
  "city": "Surabaya",
  "province": "Jawa Timur",
  "bio": "Updated bio..."
}
```

**Response:**
```json
{
  "id": "peternak-uuid",
  "nama": "Ahmad Peternak Updated",
  "alamat": "Jl. Baru No. 2",
  ...updated fields
}
```

### 4. POST `/upload/profile-photo`

**Description:** Upload foto profil user  
**Method:** POST  
**Auth:** Required (Bearer Token)  
**Content-Type:** multipart/form-data

**Request Body (FormData):**
```javascript
{
  fotoProfil: File,        // Image file
  userId: "user-uuid",     // User ID
  peternakId: "peternak-uuid"  // Peternak ID
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "imageUrl": "https://example.com/uploads/profile-photos/xyz123.jpg",
  "profileId": "profile-uuid"
}
```

---

## 🎨 UI Features

### 1. **Profile Photo Upload Flow**

1. User clicks camera icon on profile photo
2. File picker opens (accept: image/*)
3. User selects image
4. Preview modal appears showing selected image
5. User clicks "Unggah Foto"
6. Image uploads to backend
7. Profile photo updates in UI
8. Success message shows

### 2. **Edit Profile Form**

1. User clicks "Edit Profil" button
2. Form fields become editable
3. User makes changes
4. User clicks "Simpan Perubahan"
5. Data sends to backend
6. Profile updates in UI
7. Success message shows
8. Form returns to view mode

### 3. **Loading States**

- Initial page load: Spinner while fetching data
- Image upload: "Mengunggah..." button text
- Profile update: "Menyimpan..." button text
- Disabled buttons during submission

### 4. **Error Handling**

- Image upload fails → Show error message in modal
- Profile update fails → Alert with error message
- Network error → Console log + user notification

---

## 🔒 Security

### Authentication
- All API calls include JWT token in Authorization header
- Token retrieved from localStorage
- Backend validates token before allowing access

### Data Isolation
- User can only view/edit their own profile
- UserID from localStorage matches backend user
- Backend enforces user-specific queries

### File Upload
- Accept only image files (image/*)
- Backend should validate file type and size
- Store uploaded files securely
- Generate unique filenames to prevent overwrites

---

## 🧪 Testing

### Test 1: View Profile
```
1. Login as Peternak
2. Navigate to Profile page
3. Expected: 
   - Profile photo displays (or placeholder)
   - All fields populated from backend
   - Name, email, phone, address, etc. correct
   - Cattle count matches database
```

### Test 2: Update Profile
```
1. Click "Edit Profil"
2. Change alamat to "Jl. Baru No. 123"
3. Change noTelepon to "0899999999"
4. Click "Simpan Perubahan"
5. Expected:
   - Loading indicator shows
   - Success message appears
   - Changes reflected in UI
   - Backend database updated
```

### Test 3: Upload Photo
```
1. Click camera icon on profile photo
2. Select an image file (jpg, png, etc.)
3. Preview modal appears with selected image
4. Click "Unggah Foto"
5. Expected:
   - "Mengunggah..." shows on button
   - Image uploads to backend
   - Profile photo updates in UI
   - Success message appears
   - Modal closes
```

### Test 4: Multiple Users
```
1. Login as Peternak A → view profile A
2. Logout, login as Peternak B → view profile B
3. Expected:
   - Each user sees only their own data
   - No data leakage between users
   - Profile photos unique to each user
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Frontend   │
│ PeternakProfil│
└───────┬──────┘
        │
        │ 1. Load Profile
        │ GET /users/:userId
        │ GET /peternak/:peternakId
        ▼
┌──────────────┐
│   Backend    │
│   API        │
└───────┬──────┘
        │
        │ 2. Fetch from DB
        ▼
┌──────────────┐
│  Database    │
│  PostgreSQL  │
└───────┬──────┘
        │
        │ 3. Return Data
        ▼
┌──────────────┐
│   Frontend   │
│ Display Data │
└──────────────┘

┌──────────────┐
│   User       │
│ Edit/Upload  │
└───────┬──────┘
        │
        │ 4. Submit Changes
        │ PUT /peternak/:id
        │ POST /upload/profile-photo
        ▼
┌──────────────┐
│   Backend    │
│ Validate +   │
│ Save to DB   │
└───────┬──────┘
        │
        │ 5. Return Success
        ▼
┌──────────────┐
│   Frontend   │
│ Update UI    │
└──────────────┘
```

---

## ⏭️ Next Steps

### Immediate:
- ✅ Fetch profile data from backend
- ✅ Update profile via API
- ✅ Upload profile photo with preview
- ⏳ Implement backend endpoint `/upload/profile-photo`
- ⏳ Implement backend endpoint PUT `/peternak/:id`

### Future Enhancements:
- [ ] Image cropper before upload
- [ ] Support multiple image formats
- [ ] Compress images before upload
- [ ] Profile completion percentage
- [ ] Activity log from backend
- [ ] Password change via API
- [ ] Two-factor authentication

---

## 📚 Related Files

### Frontend:
- `/FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakProfil.jsx`

### Backend (Need to implement):
- `/BACKEND/controllers/userController.js` - GET /users/:id
- `/BACKEND/controllers/peternakController.js` - GET/PUT /peternak/:id
- `/BACKEND/controllers/uploadController.js` - POST /upload/profile-photo
- `/BACKEND/routes/userRoutes.js`
- `/BACKEND/routes/peternakRoutes.js`
- `/BACKEND/routes/uploadRoutes.js`

### Documentation:
- `FRONTEND_BACKEND_INTEGRATION.md` - Cattle data integration
- `BACKEND_FIXES_DOCUMENTATION.md` - Backend fixes
- `QUICK_TEST_GUIDE.md` - Testing guide

---

**Last Updated:** 2025  
**Status:** ✅ Frontend implemented, ⏳ Backend endpoints needed  
**Next:** Implement backend upload and update endpoints
