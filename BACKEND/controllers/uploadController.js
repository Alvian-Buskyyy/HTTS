const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/profile-photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, req.body.userId + '-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload profile photo controller
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;

    if (!userId) {
      // Remove uploaded file if userId is not provided
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find the profile
    const profile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (!profile) {
      // Remove uploaded file if profile not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete old profile photo if exists
    if (profile.fotoProfil) {
      const oldPhotoPath = path.join(__dirname, '../uploads/profile-photos', path.basename(profile.fotoProfil));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Generate the file URL (relative path that will be served by express.static)
    const fileUrl = `/uploads/profile-photos/${req.file.filename}`;

    // Update profile with new photo URL
    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: { fotoProfil: fileUrl }
    });

    res.status(200).json({
      message: 'Profile photo uploaded successfully',
      fotoProfil: fileUrl,
      profile: updatedProfile
    });

  } catch (error) {
    // If error occurs, try to delete uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

// Export multer middleware
exports.uploadMiddleware = upload.single('fotoProfil');

// Delete profile photo controller
exports.deleteProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete the photo file if exists
    if (profile.fotoProfil) {
      const photoPath = path.join(__dirname, '../uploads/profile-photos', path.basename(profile.fotoProfil));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Update profile to remove photo URL
    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: { fotoProfil: null }
    });

    res.status(200).json({
      message: 'Profile photo deleted successfully',
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
