const Address = require('../models/addressSchema');
const Product = require('../models/productSchema');
const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const paginate = require('../utils/pagination');
const { applyCouponToOrder, applyCouponValidation } = require('../utils/couponHelper');
const { recordCouponUsage } = require('./couponService');
const { refundPayment } = require('./paymentService');

const getOrderData = async (userId, addressId) => {

  let address;

  // If addressId is not provided, use default address
  if (!addressId) {

    address = await Address.findOne({
      userId,
      isDefault: true
    });

    if (!address) {
      throw new Error(
        'No default address found. Please provide an address ID.'
      );
    }

  } else {

    address = await Address.findOne({
      _id: addressId,
      userId
    });

    if (!address) {
      throw new Error(
        'Address not found or does not belong to you'
      );
    }
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId })
    .populate('items.productId');

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  return {
    address,
    cart
  };
};

const validateCartStock = async (cart) => {

  for (const item of cart.items) {

    const product = item.productId;

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `${product.productName} has only ${product.stock} units available. You requested ${item.quantity}.`
      );
    }
  }

  return true;
};

const buildOrderItems = (cart) => {

  const orderItems = cart.items.map(item => ({
    product: item.productId._id,
    size: item.size || 7,
    quantity: item.quantity,
    price: item.productId.price,
    name: item.productId.productName,
    productImage: item.productId.images || []
  }));

  const totalPrice = orderItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  return {
    orderItems,
    totalPrice
  };
};

const applyOrderCoupon = async (userId, couponCode, cart, totalPrice) => {

  if (!couponCode) {
    return {
      finalAmount: totalPrice,
      couponApplied: false,
      couponDiscount: 0,
      appliedCouponCode: null
    };
  }

  const productIds = cart.items.map(
    item => item.productId._id
  );

  const couponResult = await applyCouponToOrder(
    null,
    userId,
    couponCode,
    productIds,
    totalPrice
  );

  return {
    finalAmount: couponResult.finalAmount,
    couponApplied: couponResult.couponApplied,
    couponDiscount: couponResult.couponDiscount,
    appliedCouponCode: couponResult.couponCode,
    couponId: couponResult.couponId
  };
};

const validatePaymentMethod = (paymentMethod) => {

  const allowedPaymentMethods = [
    "COD",
    "Razorpay",
    "wallet"
  ];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  return true;
};

const createOrder = async ({
  userId,
  orderItems,
  totalPrice,
  shipping,
  finalAmount,
  address,
  paymentMethod,
  couponApplied,
  couponCode,
  couponDiscount,
  couponId,
}) => {

  const order = new Order({
    userId,
    orderItems,
    totalPrice,
    shipping,
    finalAmount,

    address: {
      addressType: address.addressType,
      name: address.name,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      altPhone: address.altPhone || '',
      landmark: address.landmark || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || ''
    },

    paymentMethod,
    status: 'Pending',

    couponApplied,
    couponCode,
    couponDiscount,

    invoiceNumber: generateInvoiceNumber()
  });

  await order.save();

  if (paymentMethod === 'COD') {

    // Record coupon usage
    if (couponApplied && couponId) {
      await recordCouponUsage(
        userId,
        couponId,
        couponDiscount,
        order._id
      );
    }

    // Reduce product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );
    }

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    // COD order is confirmed
    order.status = 'Processing';

    await order.save();
  }

  return order;
};

const getUserOrders = async (userId, page, limit) => {

  return await paginate(
    Order,
    { userId },
    {
      page,
      limit: limit || 10,
      sort: { createdAt: -1 },
      populate: 'orderItems.product'
    }
  );
};

const getUserOrderById = async (userId, orderId) => {

  const order = await Order.findOne({
    _id: orderId,
    userId
  }).populate(
    'orderItems.product',
    'images'
  );

  return order;
};

const cancelOrder = async (userId, orderId, cancellationReason) => {

  const order = await Order.findOne({
    _id: orderId,
    userId
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Only these statuses can be cancelled
  const cancellableStatuses = [
    'Pending',
    'Processing'
  ];

  if (!cancellableStatuses.includes(order.status)) {
    throw new Error(
      `Order cannot be cancelled. Current status: ${order.status}`
    );
  }

  if (order.paymentMethod === 'Razorpay' && order.paymentDetails?.status === 'Success') {
    const refund = await refundPayment(order.paymentDetails.razorpayPaymentId, order.finalAmount);

    order.refundDetails = {
      refundId: refund.id,
      status: refund.status === 'pending' ? 'Pending' : 'Processed',
      amount: refund.finalAmount,
      refundedAt: new Date()
    };
  }

  // Restore product stock
  for (const item of order.orderItems) {

    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity
        }
      }
    );

  }

  // Update order status
  order.status = 'Cancelled';

  order.cancellationReason = cancellationReason || 'Cancelled by user';

  order.cancellationRequestedAt = new Date();

  order.cancellationApprovedAt = new Date();

  await order.save();

  return order;
};

const getPendingRazorpayOrder = async (userId) => {
  return await Order.findOne({
    userId,
    paymentMethod: 'Razorpay',
    status: 'Pending',
    'paymentDetails.status': 'Pending'
  }).sort({ createdAt: -1 });
};

const isSameOrderItems = (orderItems, cart) => {

  if (orderItems.length !== cart.items.length) {
    return false;
  }

  return orderItems.every(orderItem => {

    const cartItem = cart.items.find(item =>
      item.productId &&
      orderItem.product &&
      item.productId._id.toString() === orderItem.product.toString() &&
      item.size === orderItem.size
    );

    if (!cartItem) {
      return false;
    }

    return cartItem.quantity === orderItem.quantity;
  });
};

const findReusableRazorpayOrder = async (userId, cart) => {

  const pendingOrder = await getPendingRazorpayOrder(userId);

  if (!pendingOrder) {
    return null;
  }

  const sameCart = isSameOrderItems(pendingOrder.orderItems, cart);

  if (!sameCart) {
    const error = new Error(
      'You already have a pending Razorpay payment. Please complete or cancel that order first.'
    );

    error.pendingOrderId = pendingOrder._id;

    throw error;
  }

  return pendingOrder;
}

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `SS-${year}-${randomNumber}`;
}

module.exports = {
  getOrderData,
  validateCartStock,
  buildOrderItems,
  applyOrderCoupon,
  validatePaymentMethod,
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelOrder,
  getPendingRazorpayOrder,
  isSameOrderItems,
  findReusableRazorpayOrder,
  generateInvoiceNumber
};