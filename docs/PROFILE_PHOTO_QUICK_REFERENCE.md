# 🚀 Quick Reference - Profile Photo Upload

## 📋 Quick Commands

### Start Backend
```bash
cd /BACKEND
npm run dev
```

### Start Frontend  
```bash
cd /FRONTEND/frontend-halal
npm run dev
```

### View Uploaded Files
```bash
ls -la /BACKEND/uploads/profile-photos/
```

## 🔌 API Endpoints

### Upload Photo
```http
POST http://localhost:3000/upload/profile-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  - fotoProfil: File
  - userId: String
```

### Get Profile
```http
GET http://localhost:3000/profile/{userId}
Authorization: Bearer {token}
```

### Delete Photo
```http
DELETE http://localhost:3000/upload/profile-photo/{userId}
Authorization: Bearer {token}
```

### Access Photo
```http
GET http://localhost:3000/uploads/profile-photos/{filename}
```

## 📁 File Locations

| Purpose | Path |
|---------|------|
| Upload Controller | `/BACKEND/controllers/uploadController.js` |
| Profile Controller | `/BACKEND/controllers/profileController.js` |
| Upload Routes | `/BACKEND/routes/uploadRoutes.js` |
| Profile Routes | `/BACKEND/routes/profileRoutes.js` |
| Storage Directory | `/BACKEND/uploads/profile-photos/` |
| Frontend Component | `/FRONTEND/.../PeternakProfil.jsx` |

## 🔧 Configuration

### Multer Settings
```javascript
fileSize: 5 * 1024 * 1024  // 5MB max
allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
destination: './uploads/profile-photos/'
filename: '{userId}-{timestamp}-{random}.{ext}'
```

### Static Files
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## 💾 Database

### Profile Model
```prisma
model Profile {
  fotoProfil  String?    // Stores: /uploads/profile-photos/filename.jpg
}
```

### Query Examples
```javascript
// Update photo URL
await prisma.profile.update({
  where: { userId: userId },
  data: { fotoProfil: '/uploads/profile-photos/file.jpg' }
});

// Get profile with photo
const profile = await prisma.profile.findUnique({
  where: { userId: userId }
});
```

## 🎨 Frontend Usage

### Upload Handler
```javascript
const uploadFormData = new FormData();
uploadFormData.append('fotoProfil', selectedImage);
uploadFormData.append('userId', userId);

const response = await fetch('http://localhost:3000/upload/profile-photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: uploadFormData
});
```

### Display Image
```jsx
<img 
  src={userData.profileImage} 
  alt="Profile" 
/>

// userData.profileImage format:
// "http://localhost:3000/uploads/profile-photos/filename.jpg"
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 400 Error | Check userId in FormData |
| 404 Error | Verify routes in app.js |
| 500 Error | Check uploads directory exists |
| Image not showing | Add http://localhost:3000 prefix |
| Old photo not deleted | Check file permissions |

## 🧪 Quick Test

### 1. cURL Upload
```bash
curl -X POST http://localhost:3000/upload/profile-photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fotoProfil=@/path/to/image.jpg" \
  -F "userId=YOUR_USER_ID"
```

### 2. Browser Test
1. Login as Peternak
2. Navigate to Profile
3. Click camera icon
4. Select image
5. Click "Unggah Foto"

### 3. Verify Storage
```bash
ls /BACKEND/uploads/profile-photos/
# Should see: userId-timestamp-random.jpg
```

### 4. Direct Access
```
http://localhost:3000/uploads/profile-photos/YOUR-FILENAME.jpg
```

## 📊 Response Formats

### Success Response
```json
{
  "message": "Profile photo uploaded successfully",
  "fotoProfil": "/uploads/profile-photos/user123-1699123456789-987654321.jpg",
  "profile": {
    "id": "profile-id",
    "userId": "user-id",
    "fotoProfil": "/uploads/profile-photos/user123-1699123456789-987654321.jpg"
  }
}
```

### Error Response
```json
{
  "error": "No file uploaded"
}
```

## 🔐 Security

✅ Authentication required (JWT)
✅ File type validation (images only)
✅ File size limit (5MB)
✅ Unique filenames (no overwrites)
✅ Old file cleanup
✅ No path traversal

## 📚 Documentation Files

1. `PROFILE_PHOTO_UPLOAD.md` - Full documentation
2. `PROFILE_PHOTO_TEST_GUIDE.md` - Testing guide
3. `PROFILE_PHOTO_IMPLEMENTATION_SUMMARY.md` - Changes summary
4. `PROFILE_PHOTO_CHECKLIST.md` - Implementation checklist

## 🎯 Key Features

- ✅ Upload profile photo
- ✅ Preview before upload
- ✅ Replace existing photo
- ✅ Auto-delete old photo
- ✅ Display uploaded photo
- ✅ Error handling
- ✅ Loading states
- ✅ Success notifications

## 📞 Support

If issues persist:
1. Check backend logs
2. Check browser console
3. Verify file permissions
4. Review documentation
5. Check API responses

---

**Quick Start**: 
```bash
cd BACKEND && npm run dev
cd FRONTEND/frontend-halal && npm run dev
# Then test upload at: http://localhost:5173/profile
```

**Version**: 1.0.0
