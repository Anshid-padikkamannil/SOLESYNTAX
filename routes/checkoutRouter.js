const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');
const { 
  createRazorpayOrder,
  verifyPayment,
  getCheckout, 
  applyCheckoutCoupon,
} = require('../controllers/user/checkoutController');

const { createOrder } = require('../controllers/user/orederController');


router.use(isLoggedIn);

// Router to create a Razorpay order 
router.post('/create-order', createRazorpayOrder);

router.post('/verify', verifyPayment);

router.get('/', getCheckout);
router.post('/coupon', applyCheckoutCoupon);
router.post('/order', createOrder);

module.exports = router;