const Product = require('../models/productSchema');
const Cart = require('../models/cartSchema');


// Add product to cart
const addItemToCart = async (userId, productId, quantity, size) => {

  if (!size) {
    throw new Error('Size is required.');
  }

  if (!quantity || quantity < 1) {
    throw new Error('Quantity must be at least 1.');
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found.');
  }
  

  if (product.stock <= 0) {
    throw new Error('This product is currently out of stock.');
  }

  // Maximum quantity allowed per product
  const maxPerOrder = 10;
  const allowedQuantity = Math.min(maxPerOrder, product.stock);

  if (quantity > allowedQuantity) {
    throw new Error(
      `You can only purchase up to ${allowedQuantity} item(s).`
    );
  }

  // Find user's cart
  let cart = await Cart.findOne({ userId });

  // Create cart if user doesn't have one
  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId,
          quantity,
          size
        }
      ]
    });

    await cart.save();

    return cart;
  }

  // Check if same product + same size already exists
  const existingItem = cart.items.find(
    item =>
      item.productId.toString() === productId &&
      item.size === size
  );

  if (existingItem) {

    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > allowedQuantity) {
      throw new Error(
        `You can only purchase up to ${allowedQuantity} item(s).`
      );
    }

    existingItem.quantity = newQuantity;

  } else {

    cart.items.push({
      productId,
      quantity,
      size
    });
  }

  await cart.save();

  return cart;
};


// Get user's cart
const getUserCart = async (userId) => {

  const cart = await Cart.findOne({ userId })
    .populate(
      'items.productId',
      'productName brand price images stock'
    );

  if (!cart || cart.items.length === 0) {  
    return null;
  }
  
  let subtotal = 0;

  cart.items.forEach(item => {
    subtotal += item.productId.price * item.quantity;
  });

  return {
    cart,
    subtotal,
  }  
};


// Update cart item quantity
const updateCartItem = async (userId, productId, size, quantity) => {

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found.');
  }

  const allowedQuantity = Math.min(product.stock, 10);

  if (quantity < 1 || quantity > allowedQuantity) {
    throw new Error(
      `Quantity must be between 1 and ${allowedQuantity}.`
    );
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error('Cart not found.');
  }

  const item = cart.items.find(item => {
    return (
      item.productId &&
      item.productId.toString() === productId &&
      item.size === Number(size)
    );
  });

  if (!item) {
    throw new Error('Product not found in cart.');
  }

  item.quantity = quantity;

  await cart.save();

  return cart;
};


// Remove item from cart
const removeCartItem = async (userId, productId, size) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error('Cart not found.');
  }

  const itemsBefore = cart.items.length;

  cart.items = cart.items.filter(item => {
    return !(
      item.productId.toString() === productId &&
      item.size === Number(size)
    );
  });

  if (itemsBefore === cart.items.length) {
    throw new Error('Cart item not found.');
  }

  await cart.save();

  return cart;
};


// Clear user's cart
const removeOrderedItemsFromCart = async (userId, orderItems) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return true;
  }

  cart.items = cart.items.filter(cartItem => {
    return !orderItems.some(orderItem => orderItem.product.toString() === cartItem.productId.toString() && orderItem.size === cartItem.size );
  });

  await cart.save();

  return true;
};


module.exports = {
  addItemToCart,
  getUserCart,
  updateCartItem,
  removeCartItem,
  removeOrderedItemsFromCart
};