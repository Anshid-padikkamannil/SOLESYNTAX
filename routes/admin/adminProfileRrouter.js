const express = require('express');

const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const {
  getAdminDashboard
} = require('../../controllers/admin/adminDashboardController');

router.get('/', isLoggedIn, isAdmin, getAdminDashboard);

module.exports = router;