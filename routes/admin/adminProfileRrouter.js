const express = require('express');

const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const {
  getAdminDashboard
} = require('../../controllers/admin/adminDashboardController');

const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminProfilePicture
} = require('../../controllers/admin/adminProfileController');

const upload = require('../../config/multer');

router.use(isLoggedIn, isAdmin)

router.get('/', getAdminDashboard);

// Admin profile page
router.get('/profile', getAdminProfile);
router.post('/profile/update', updateAdminProfile);

router.post('/profile/change-password',changeAdminPassword);

router.post('/profile/picture',
  upload.uploadProfilePicture.single('profilePicture'),
  uploadAdminProfilePicture
);

module.exports = router;