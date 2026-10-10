const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const {
  getAdminReportsPage,
  getSalesReport
} = require('../../controllers/admin/reportController');

router.use(isLoggedIn, isAdmin);

router.get('/', getAdminReportsPage);

router.get('/sales', getSalesReport);

module.exports = router;