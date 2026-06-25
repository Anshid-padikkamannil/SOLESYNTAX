const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const Order = require('../../models/orderSchema');
const paginate = require('../../utils/pagination');


const adminGetAllOrders = async (req, res) => {
  
  try {

    const result = await paginate(
      Order,
      {},
      {
        page: req.query.page,
        limit: req.query.limit || 20,
        sort: { createdAt: -1 },
        populate: 'userId'
      }
    )

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
}

const adminUpdateOrderStatus = async (req, res) => {

  try {
    
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found'});
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (err) {
    
    res.status(500).json({ message: err.message });

  }
};

module.exports = {
  adminGetAllOrders,
  adminUpdateOrderStatus
}