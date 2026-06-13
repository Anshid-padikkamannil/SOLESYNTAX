const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const Order = require('../../models/orderSchema');
const mongoose = require('mongoose');

const createOrder  = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0 ) {

      return res.status(400).json({ message: 'Cart is empty'});

    }

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.productName} has only ${product.stock} units available. You requested ${item.quantity}.`
        });
      }
    }

    // 2. Build order items
    const orderItems = cart.items.map(item => ({
      product: item.productId._id,
      size: item.size || 7,
      quantity: item.quantity,
      price: item.productId.price,
      name: item.productId.productName,
      productImage: item.productId.images || []
    }));

    let totalPrice = 0;
    for (const item of orderItems) {
      totalPrice += item.price * item.quantity;
    }

    // 4. Create order
    const order = new Order({
      userId,
      orderId: `ORD-${Date.now()}`,
      orderItems,
      totalPrice,
      finalAmount : totalPrice,
      address: {  // Dummy address for testing
        addressType: "Home",
        name: "Test User",
        city: "Test City",
        state: "Test State",
        pincode: 123456,
        phone: "1234567890"
      },
      paymentMethod: "COD",  // Default for testing
      status: 'Pending',
      invoiceDate: new Date(),
      createdOn: new Date()
    });

    await order.save();
       // ⭐ ADD: Update product stock
      for (const item of cart.items) {
          await Product.findByIdAndUpdate(
            item.productId._id,
            { $inc: { stock: -item.quantity } },
        );
      }

      await Cart.findOneAndDelete({ userId })


      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      })

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
};

module.exports = {
  createOrder, 
}