# Quick Test Guide - Profile Photo Upload

## Prerequisites
1. Backend server running on port 3000
2. Frontend server running (Vite)
3. Multer package installed (`npm install multer` in BACKEND directory)
4. Uploads directory created at `/BACKEND/uploads/profile-photos/`
5. User logged in as Peternak

## Test Steps

### Step 1: Start Backend Server
```bash
cd /home/xfhreall/Documents/coding/HTTS/BACKEND
npm run dev
# Or: node app.js
```

Expected output:
```
Server is running on port 3000
```

### Step 2: Start Frontend Server
```bash
cd /home/xfhreall/Documents/coding/HTTS/FRONTEND/frontend-halal
npm run dev
```

### Step 3: Login as Peternak
1. Open browser to `http://localhost:5173` (or your Vite port)
2. Login with Peternak credentials
3. Navigate to Profile page

### Step 4: Test Upload Flow

#### A. View Current Profile
- Profile page should load
- Default profile image should display (placeholder if no photo uploaded)

#### B. Select Photo
1. Click the **camera icon** on the profile image
2. File picker should open
3. Select an image file (JPEG, PNG, or GIF)
4. Preview modal should appear showing the selected image

#### C. Upload Photo
1. In the preview modal, click **"Unggah Foto"** button
2. Loading state should show ("Mengunggah...")
3. Wait for upload to complete
4. Success message should appear
5. Profile image should update with new photo
6. Modal should close automatically

#### D. Verify Upload
1. Check that profile image displays correctly
2. Refresh page - photo should persist
3. Check backend directory: `/BACKEND/uploads/profile-photos/`
4. File should exist with format: `userId-timestamp-random.ext`

### Step 5: Test Upload Again (Replace Photo)
1. Click camera icon again
2. Select a different photo
3. Upload new photo
4. New photo should replace old one
5. Check backend directory - old file should be deleted

### Step 6: Verify Database
Check Profile record in database:
```javascript
// Using Prisma Studio or SQL
SELECT fotoProfil FROM Profile WHERE userId = 'YOUR_USER_ID';
// Should show: /uploads/profile-photos/filename.jpg
```

### Step 7: Test Static File Access
In browser, visit:
```
http://localhost:3000/uploads/profile-photos/YOUR-FILENAME.jpg
```
Image should display directly.

## Test Scenarios

### Scenario 1: First Time Upload
- User has no profile photo
- Default placeholder displays
- Upload photo successfully
- Photo appears immediately

### Scenario 2: Replace Existing Photo
- User has existing profile photo
- Upload new photo
- Old photo is deleted
- New photo displays

### Scenario 3: Invalid File Type
- Try to upload PDF or other non-image file
- Should be rejected by multer
- Error message should appear

### Scenario 4: Large File
- Try to upload file > 5MB
- Should be rejected
- Error message: file too large

### Scenario 5: Cancel Upload
- Select photo (preview appears)
- Click "Batal" button
- Modal closes without uploading
- Profile photo unchanged

## Expected API Calls

### 1. Initial Load
```
GET http://localhost:3000/users/:userId
GET http://localhost:3000/peternak/:peternakId
```

Response should include:
```json
{
  "id": "peternak-id",
  "nama": "Peternak Name",
  "profiles": [
    {
      "fotoProfil": "/uploads/profile-photos/filename.jpg"
    }
  ]
}
```

### 2. Photo Upload
```
POST http://localhost:3000/upload/profile-photo
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

FormData:
  - fotoProfil: [File]
  - userId: "user-id"
  - peternakId: "peternak-id"
```

Response:
```json
{
  "message": "Profile photo uploaded successfully",
  "fotoProfil": "/uploads/profile-photos/userId-timestamp-random.jpg",
  "profile": { /* profile object */ }
}
```

## Troubleshooting

### Problem: Upload button does nothing
**Check:**
- Browser console for errors
- Network tab for failed requests
- Backend server is running
- Token is valid

### Problem: Photo doesn't display after upload
**Check:**
- fotoProfil field in database
- File exists in /BACKEND/uploads/profile-photos/
- Static file serving is configured in app.js
- Full URL is constructed correctly (http://localhost:3000 prefix)

### Problem: 400 Bad Request
**Check:**
- userId is being sent in FormData
- File is being attached to FormData
- Content-Type header is NOT set (let browser set it for multipart/form-data)

### Problem: 404 Not Found
**Check:**
- Route is registered in app.js: `app.use('/upload', uploadRoutes)`
- uploadRoutes.js exports router correctly
- Endpoint path is correct: `/upload/profile-photo`

### Problem: 500 Internal Server Error
**Check:**
- Backend logs for error details
- Uploads directory exists and is writable
- Profile record exists for userId
- Prisma connection is working

### Problem: Old photo not deleted
**Check:**
- File paths match between upload and delete
- fs.existsSync() returns true for old file
- Permissions allow file deletion

## Success Criteria

✅ Photo uploads successfully
✅ Photo displays immediately after upload
✅ Photo persists after page refresh
✅ Old photo is deleted when uploading new one
✅ Photo is accessible via direct URL
✅ Database record is updated with foto URL
✅ Error messages display for invalid files
✅ Loading states work correctly
✅ Cancel button works properly
✅ No console errors

## Test with cURL

```bash
# Get auth token first (login)
TOKEN="your-jwt-token"
USER_ID="your-user-id"

# Upload photo
curl -X POST http://localhost:3000/upload/profile-photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "fotoProfil=@/path/to/test-image.jpg" \
  -F "userId=$USER_ID"

# Expected response
{
  "message": "Profile photo uploaded successfully",
  "fotoProfil": "/uploads/profile-photos/...",
  "profile": { ... }
}

# Verify file was created
ls -la /home/xfhreall/Documents/coding/HTTS/BACKEND/uploads/profile-photos/

# Access photo directly
curl http://localhost:3000/uploads/profile-photos/FILENAME.jpg
```

## Performance Checks

- Upload time should be < 2 seconds for typical images (< 2MB)
- Page load with profile photo should be smooth
- No memory leaks after multiple uploads
- File system should not accumulate orphaned files

## Security Checks

✅ Only image files accepted
✅ File size limited to 5MB
✅ Authentication required
✅ No path traversal vulnerabilities
✅ Unique filenames prevent conflicts
✅ Old files properly cleaned up

---

**Test Date**: _______________
**Tester**: _______________
**Result**: ⬜ PASS  ⬜ FAIL
**Notes**: 
_______________________________________________
_______________________________________________
_______________________________________________
