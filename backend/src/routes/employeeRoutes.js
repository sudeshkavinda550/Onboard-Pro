const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { isHROrAdmin } = require('../middleware/roleCheck');

// Cloudinary setup
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
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  },
});

const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(authenticate);

router.get('/profile', employeeController.getProfile);
router.put('/profile', employeeController.updateProfile);
router.get('/dashboard', employeeController.getDashboard);
router.get('/documents', employeeController.getDocuments);

router.post('/profile/picture',
  upload.single('profilePicture'),
  employeeController.uploadProfilePicture
);

router.use(isHROrAdmin);

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create new employee
router.post('/', employeeController.createEmployee);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Delete employee
router.delete('/:id', employeeController.deleteEmployee);

// Get employee tasks/progress
router.get('/:id/tasks', employeeController.getEmployeeTasks);
router.get('/:id/progress', employeeController.getEmployeeProgress);

// Send reminder to employee
router.post('/:id/reminder', employeeController.sendReminder);

module.exports = router;