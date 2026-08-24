const razorpay = require('../config/razorpay');
const Order = require('../models/orderSchema');
const Product = require('../models/productSchema');
const Coupon = require('../models/couponSchema');
const Cart = require('../models/cartSchema');
const crypto = require('crypto');
const { recordCouponUsage } = require('./couponService');
const { removeOrderedItemsFromCart } = require('./cartService');


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
    amount: Math.round(order.finalAmount * 100), // Convert ₹ to paise. why {It expects the smallest unit of the currency in our case 1 Rupee = 100 Paise so we multiply by 100}
    currency: 'INR',
    receipt: order._id.toString(),
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

  //5. record coupon useage
  if (order.couponApplied && order.couponCode) {

    const coupon = await Coupon.findOne({
      code: order.couponCode
    });

    if (coupon) {
      await recordCouponUsage(
        userId,
        coupon._id,
        order.couponDiscount,
        order._id
      );
    }
  }

  //6 reduce product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: -item.quantity
        }
      }
    );
  }

  // 7 clear cart
  await removeOrderedItemsFromCart(
    userId,
    order.orderItems
  );

  // 8. Payment successful → 'Pending' to 'Processing'
  order.status = 'Processing';

  await order.save();

  return {
    success: true,
    message: 'Payment verified successfully',
    order
  };
};

const refundPayment = async (razorpayPaymentId, amount) => {
  
  const refund = await razorpay.payments.refund(
    razorpayPaymentId,
    {
      amount: Math.round(amount * 100),
      speed: 'normal'
    }
  );

  return refund;
}

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  refundPayment
}