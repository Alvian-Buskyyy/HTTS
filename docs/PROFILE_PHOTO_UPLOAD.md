# Profile Photo Upload Implementation

## Overview
This document describes the implementation of the profile photo upload feature for the Halal Traceability System.

## Backend Implementation

### 1. Upload Controller (`/BACKEND/controllers/uploadController.js`)

**Features:**
- Handles profile photo upload with file validation
- Stores files in `/BACKEND/uploads/profile-photos/` directory
- Accepts only image files (JPEG, PNG, GIF)
- Maximum file size: 5MB
- Generates unique filenames: `userId-timestamp-random.ext`
- Updates Profile table with photo URL
- Automatically deletes old photo when uploading new one
- Provides endpoint to delete profile photos

**Key Functions:**
- `uploadProfilePhoto`: Handles photo upload and database update
- `deleteProfilePhoto`: Deletes photo file and removes URL from database
- `uploadMiddleware`: Multer middleware for file handling

**Request Format:**
```javascript
POST /upload/profile-photo
Content-Type: multipart/form-data

FormData:
  - fotoProfil: File (image file)
  - userId: String (required)
  - peternakId: String (optional, for future use)
```

**Response Format:**
```json
{
  "message": "Profile photo uploaded successfully",
  "fotoProfil": "/uploads/profile-photos/userId-timestamp-random.jpg",
  "profile": { /* Updated profile object */ }
}
```

### 2. Profile Controller (`/BACKEND/controllers/profileController.js`)

**Features:**
- Get profile data by userId
- Update profile and entity data
- Supports all entity types (Peternak, PasarHewan, Jagal, RPH, etc.)

**Endpoints:**
- `GET /profile/:userId` - Get complete profile with entity data
- `PUT /profile/:userId` - Update profile and entity data

### 3. Routes Configuration

**Upload Routes (`/BACKEND/routes/uploadRoutes.js`):**
```javascript
POST /upload/profile-photo     // Upload profile photo
DELETE /upload/profile-photo/:userId  // Delete profile photo
```

**Profile Routes (`/BACKEND/routes/profileRoutes.js`):**
```javascript
GET /profile/:userId    // Get profile
PUT /profile/:userId    // Update profile
```

### 4. Static File Serving

The backend serves uploaded files via:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

Files are accessible at: `http://localhost:3000/uploads/profile-photos/filename.jpg`

### 5. Database Schema

The `Profile` model in Prisma schema has a `fotoProfil` field:
```prisma
model Profile {
  id          String     @id @default(uuid())
  entityType  EntityType
  fotoProfil  String?    // URL to profile photo
  user        User       @relation(fields: [userId], references: [id])
  userId      String     @unique
  // ... other relations
}
```

## Frontend Implementation

### 1. PeternakProfil.jsx Component

**Features:**
- Display current profile photo
- Preview photo before upload
- Upload photo to backend
- Update profile display with new photo
- Error handling and loading states

**Key State Variables:**
```javascript
const [selectedImage, setSelectedImage] = useState(null);        // Selected file
const [imagePreview, setImagePreview] = useState(null);          // Preview URL
const [isUploadingImage, setIsUploadingImage] = useState(false); // Upload state
const [uploadImageError, setUploadImageError] = useState('');    // Error message
```

**Upload Flow:**
1. User clicks camera icon to select photo
2. Photo preview modal appears
3. User confirms upload
4. Photo is sent to backend via FormData
5. Backend returns photo URL
6. Frontend updates display with new photo
7. Success message appears

**API Integration:**
```javascript
// Fetch profile photo on load
const profileImage = peternak.profiles?.[0]?.fotoProfil 
  ? `http://localhost:3000${peternak.profiles[0].fotoProfil}` 
  : 'https://via.placeholder.com/150';

// Upload photo
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

## File Structure

```
BACKEND/
├── controllers/
│   ├── uploadController.js      # Photo upload logic
│   ├── profileController.js     # Profile CRUD
│   └── peternakController.js    # Updated to include profiles
├── routes/
│   ├── uploadRoutes.js          # Upload endpoints
│   └── profileRoutes.js         # Profile endpoints
├── uploads/
│   └── profile-photos/          # Storage directory
└── app.js                       # Routes registration & static serving

FRONTEND/
└── frontend-halal/
    └── src/
        └── modules/
            └── peternak/
                └── pages/
                    └── PeternakProfil.jsx  # Profile page with upload
```

## Dependencies

### Backend
- `multer`: ^1.4.5-lts.1 - File upload handling
- `express`: ^4.21.2 - Web framework
- `@prisma/client`: ^6.5.0 - Database ORM

### Frontend
- React with hooks (useState, useEffect)
- Fetch API for HTTP requests
- FormData for multipart uploads

## Security Considerations

1. **File Type Validation**: Only accepts image files (JPEG, PNG, GIF)
2. **File Size Limit**: Maximum 5MB per file
3. **Authentication**: Requires Bearer token in Authorization header
4. **Unique Filenames**: Prevents file overwrites and conflicts
5. **Old File Cleanup**: Automatically deletes previous photos

## Testing Guide

### 1. Test Upload Endpoint
```bash
# Test with curl
curl -X POST http://localhost:3000/upload/profile-photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fotoProfil=@/path/to/image.jpg" \
  -F "userId=USER_ID"
```

### 2. Test Frontend Flow
1. Login as Peternak
2. Navigate to Profile page
3. Click camera icon on profile image
4. Select a photo
5. Preview should appear
6. Click "Unggah Foto" button
7. Photo should upload and display
8. Check `/BACKEND/uploads/profile-photos/` for saved file

### 3. Verify Database
```javascript
// Check profile record
await prisma.profile.findUnique({
  where: { userId: 'USER_ID' }
});
// Should have fotoProfil field with URL
```

### 4. Test Static File Access
Visit: `http://localhost:3000/uploads/profile-photos/filename.jpg`
Should display the uploaded image

## Error Handling

### Backend Errors
- 400: No file uploaded or missing userId
- 404: Profile not found
- 500: Server error (file system, database)

### Frontend Errors
- Network errors: Caught and displayed to user
- Invalid file type: Rejected by multer
- Upload failure: Error message shown in modal

## Future Enhancements

1. **Image Optimization**: Resize/compress images before storage
2. **Cloud Storage**: Use S3/Cloudinary instead of local storage
3. **Multiple Photos**: Support photo galleries
4. **Image Cropping**: Allow users to crop photos before upload
5. **CDN Integration**: Serve images via CDN for better performance
6. **Thumbnail Generation**: Create thumbnails for faster loading

## Troubleshooting

### Issue: Upload fails with 400 error
**Solution**: Ensure userId is being sent in FormData

### Issue: Photo doesn't display after upload
**Solution**: Check that fotoProfil URL starts with `/uploads/` and backend static serving is configured

### Issue: Old photos not deleted
**Solution**: Verify file paths match between upload and delete operations

### Issue: File size too large
**Solution**: Reduce image size or increase limit in uploadController.js

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload/profile-photo` | Upload profile photo | Required |
| DELETE | `/upload/profile-photo/:userId` | Delete profile photo | Required |
| GET | `/profile/:userId` | Get profile data | Required |
| PUT | `/profile/:userId` | Update profile data | Required |
| GET | `/peternak/:id` | Get peternak with profiles | Required |
| PUT | `/peternak/:id` | Update peternak data | Required |

## Environment Variables

Currently using hardcoded values. Consider adding:
```env
UPLOAD_DIR=/path/to/uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
```

## Notes

- Profile photos are stored in the local file system
- Each user can have one profile photo
- Uploading a new photo automatically deletes the old one
- Photos are served directly by Express static middleware
- Frontend constructs full URL by prepending `http://localhost:3000`

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
