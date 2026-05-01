const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'onboard-pro/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'onboard-pro/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
  },
});

const uploadProfile = multer({ storage: profileStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports = { cloudinary, uploadProfile, uploadDocument };