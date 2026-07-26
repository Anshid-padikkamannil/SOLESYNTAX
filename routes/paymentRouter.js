const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');

router.use(isLoggedIn);

// Router to create a Razorpay order 
router.post('/create-order', createRazorpayOrder);

router.post('/verify', verifyPayment);

module.exports = router;