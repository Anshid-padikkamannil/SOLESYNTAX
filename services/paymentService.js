const razorpay = require('../config/razorpay');
const Order = require('../models/orderSchema');
const Product = require('../models/productSchema');
const Coupon = require('../models/couponSchema');
const crypto = require('crypto');
const { recordCouponUsage } = require('./couponService');
const { removeOrderedItemsFromCart } = require('./cartService');
const {
  createNotification
} = require('../controllers/admin/notificationController');


/**
 * Step 1: Create a Razorpay Order
 */

const createRazorpayOrder = async (appOrderId, userId) => {
  //1. Fetch the order from our database to verify it belongs to the user
  const order = await Order.findOne({ _id: appOrderId, userId });
  
  if (!order) {
    throw new Error('Order not found or does not belong to user');
  }

  if (order.status === 'Cancelled') {
    throw new Error('This order has been cancelled and cannot be paid.');
  }

  if (order.paymentDetails?.status === 'Success') {
    throw new Error('This order has already been paid.');
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

  if (order.paymentDetails?.status === 'Success') {
    return {
      success: true,
      message: 'Payment has already been verified',
      order
    };
  }

  // 4. Update payment details and move order status forward
  order.paymentDetails = {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: 'Success',
    paidAt: new Date()
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

    try {

      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity
          }
        },
        {
          returnDocument: 'after'
        }
      );

      if (!updatedProduct) {
        continue;
      }

      const remainingStock = updatedProduct.stock;
      const previousStock = remainingStock + item.quantity;

      // Out of stock
      if (previousStock > 0 && remainingStock <= 0) {
        await createNotification({
          type: 'out_of_stock',
          title: 'Product Out of Stock',
          message: `${updatedProduct.productName} is now out of stock.`,
          link: `/admin/products/edit-product/${updatedProduct._id}`
        });
      }

      // Low stock
      else if (previousStock >= 5 && remainingStock > 0 &&
        remainingStock < 5
      ) {
        await createNotification({
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${updatedProduct.productName} has only ${remainingStock} item(s) left.`,
          link: `/admin/products/edit-product/${updatedProduct._id}`
        });
      }

    } catch (notificationError) {

      // Notification failure should never break order creation
      console.error(
        'STOCK NOTIFICATION ERROR:',
        notificationError
      );

    }

  }

  // 7 clear cart
  await removeOrderedItemsFromCart(
    userId,
    order.orderItems
  );

  // 8. Payment successful → 'Pending' to 'Processing'
  order.status = 'Processing';

  await order.save();

  //notify the admin after payment verification succeeds
  try {
    await createNotification({
    type: 'new_order',
    title: 'Razorpay Payment Successful',
    message: `Payment received for order ${order._id}.`,
    link: `/admin/orders/${order._id}`
  });
    
  } catch (notificationError) {
    console.error(
    'RAZORPAY NOTIFICATION ERROR:',
    notificationError
  );
  }

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