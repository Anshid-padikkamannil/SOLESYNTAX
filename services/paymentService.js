const razorpay = require('../config/razorpay');
const Order = require('../models/orderSchema');
const crypto = require('crypto');


/**
 * Step 1: Create a Razorpay Order
 */

const createRazorpayOrder = async (appOrderId, userId) => {
  //1. Fetch the order from our database to verify it belongs to the user
  const order = await Order.findOne({ _id: appOrderId, userId });
  if (!order) {
    throw new Error('Order not found or does not belong to user');
  }

  // 2. Prepare the options for Razorpay
  const options = {
    amount: order.finalAmount * 100, // Convert ₹ to paise. why {It expects the smallest unit of the currency in our case 1 Rupee = 100 Paise so we multiply by 100}
    currency: 'INR',
    receipt: order.orderId,
    payment_capture: 1
  };

  // 3. Ask Razorpay to create the order
  const razorpayOrder = await razorpay.orders.create(options);

  // 4. Save the Razorpay order ID in our database so we can track it later
  order.paymentDetails = {
    razorpayOrderId: razorpayOrder.id,
    status: 'Pending'
  };
  await order.save();

  return {
    key_id: process.env.RAZORPAY_KEY_ID,
    order: razorpayOrder,
    appOrderId: order._id
  };
};

/**
 * Step 2: Verify the payment signature after the user pays
 */

const verifyPayment = async (payload) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    appOrderId,
    userId
  } = payload;

  // 1. Recreate the signature using our secret key
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  // 2. Compare the signatures
  if (expectedSignature !== razorpay_signature) {
    throw new Error('Invalid payment signature. Transaction may be tampered.');
  }

  // 3. Find the user's order in the database
  const order = await Order.findOne({ _id: appOrderId, userId });
  if (!order) {
    throw new Error('Order not found');
  }

  // 4. Update payment details and move order status forward
  order.paymentDetails = {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: 'Success'
  };
  order.status = 'Processing'; // move from 'Pending' to 'Processing'
  await order.save();

  return {
    success: true,
    message: 'Payment verified successfully',
    order
  };
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
}