const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../middlewares/auth');

const {
  validateCoupon
} = require('../../controllers/user/couponController');

router.use( isLoggedIn );

router.post('/validate', validateCoupon)

module.exports = router;