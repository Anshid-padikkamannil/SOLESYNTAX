const Address = require('../models/addressSchema');
const Product = require('../models/productSchema');
const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const paginate = require('../utils/pagination');
const { applyCouponToOrder, applyCouponValidation } = require('../utils/couponHelper');
const { recordCouponUsage } = require('./couponService');

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

    invoiceDate: new Date(),
    createdOn: new Date()
  });

  await order.save();

  if (couponApplied && couponId) {
    await recordCouponUsage(
      userId,
      couponId,
      couponDiscount
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

  // Clear user's cart
  await Cart.findOneAndDelete({ userId });

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

module.exports = {
  getOrderData,
  validateCartStock,
  buildOrderItems,
  applyOrderCoupon,
  validatePaymentMethod,
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelOrder
};