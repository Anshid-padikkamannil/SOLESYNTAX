const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');
const { 
  createRazorpayOrder,
  verifyPayment,
  getCheckout, 
  applyCheckoutCoupon
} = require('../controllers/user/checkoutController');


router.use(isLoggedIn);

// Router to create a Razorpay order 
router.post('/create-order', createRazorpayOrder);

router.post('/verify', verifyPayment);

router.get('/', getCheckout);
router.post('/coupon', applyCheckoutCoupon);

module.exports = router;