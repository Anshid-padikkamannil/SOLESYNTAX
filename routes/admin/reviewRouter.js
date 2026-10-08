const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const {
  getReviewsPage,
  updateReviewStatus
} = require('../../controllers/admin/reviewController');

router.use(isLoggedIn, isAdmin);

router.get('/', getReviewsPage);

router.patch('/:id/status', updateReviewStatus);

module.exports = router;