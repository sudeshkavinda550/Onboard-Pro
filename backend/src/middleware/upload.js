const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile pictures storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'onboard-pro/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

// Documents/templates storage
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'onboard-pro/documents',
      resource_type: isImage ? 'image' : 'raw',
      allowed_formats: [
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        'pdf', 'doc', 'docx', 'xls', 'xlsx',
        'ppt', 'pptx', 'txt', 'csv', 'zip'
      ],
    };
  },
});

// Profile picture upload
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('profile_picture');

// Template document upload (single)
const templateDocumentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

// Template documents upload (multiple)
const templateDocumentsUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('files', 10);

// Generic upload
const genericUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

module.exports = {
  profileUpload,
  templateDocumentUpload,
  templateDocumentsUpload,
  genericUpload,
  multer,

  // deleteFile - now deletes from Cloudinary
  deleteFile: async (filePath) => {
    try {
      await cloudinary.uploader.destroy(filePath);
      return true;
    } catch (err) {
      console.error('Cloudinary delete error:', err);
      return true;
    }
  },

  // getFileUrl - Cloudinary already returns full URL
  getFileUrl: (req, filePath) => {
    return filePath || null;
  },

  cleanupTempFiles: () => { return 0; } // No longer needed
};