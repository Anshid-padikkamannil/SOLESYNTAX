const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const Order = require('../../models/orderSchema');
const paginate = require('../../utils/pagination');
const Address = require('../../models/addressSchema');

const createOrder  = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;
    const { addressId, paymentMethod = 'COD' } = req.body || {};

    let address;

    // If addressId not provided, get default address
    if (!addressId) {
      address = await Address.findOne({ userId, isDefault: true });
      if (!address) {
        return res.status(400).json({
          message: 'No default address found. Please provide an address ID.'
        });
      }
    } else {
      address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return res.status(404).json({
          message: 'Address not found or does not belong to you'
        });
      }
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0 ) {

      return res.status(400).json({ message: 'Cart is empty'});

    }

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);

      if(!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

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

const allOrders =  async (req, res) => {
  try {

    const userId = req.user.userId || req.user._id;

    const result = await paginate(
      Order,
      { userId },
      {
        page: req.query.page,
        limit: req.query.limit || 10,
        sort: { createdAt: -1 },
        populate: 'orderItems.product'
      }
    )

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
}

const getOrderById = async (req, res) => {
  
  try {

    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId})
      // .populate('orderItems.porduct', 'productName price images')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    })
    
  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
}

const cancelOrder = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const cancelabelStatuses = ['Pending', 'Processing'];
    if (!cancelabelStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    try {
      
      for(const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          //{ session }
        );
      }

      order.status = 'Cancelled';
      order.cancellationReason = req.body.reason || 'Cancelled by user';
      order.cancellationRequestedAt = new Date();
      order.cancellationApprovedAt = new Date();

      // await order.save({ session });

      // await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order
      });


    } catch (err) {
      // await session.aboutTransaction();
      throw error;
    } finally {
      // session.endSession();
    }

  } catch (err) {
    
    res.status(500).json({ message: err.message });
    
  }
}

module.exports = {
  createOrder,
  allOrders,
  getOrderById,
  cancelOrder
}