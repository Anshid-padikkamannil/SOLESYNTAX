const Order = require('../../models/orderSchema');
const paginate = require('../../utils/pagination');
const { generateInvoice } = require('../../services/invoiceService');
const mongoose = require('mongoose');
const User = require('../../models/userSchema');


const getAdminOrdersPage = async (req, res) => {
  
  try {

    const filter = {};

    const validStatuses = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Return Request',
    'Returned'
  ];

  if (validStatuses.includes(req.query.orderStatus)) {
    filter.status = req.query.orderStatus;
  }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (mongoose.Types.ObjectId.isValid(search)) {
        filter._id = new mongoose.Types.ObjectId(search);
      } else {
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');

        filter.userId = {
          $in: users.map(user => user._id)
        };
      }

    }

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Delivered' })
    ]);

    const result = await paginate(
      Order,
      filter,
      {
        page: req.query.page || 1,
        limit: req.query.limit || 5,
        sort: { createdAt: -1 },
        populate: 'userId'
      }
    )

    res.render('admin/orders', {
      layout: 'layouts/admin-layout',
      title: 'Orders',
      currentPage: 'orders',
      orders: result.data,
      pagination: result.pagination,
      search: req.query.search || '',
      orderStatus: req.query.orderStatus || '',
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
    });

  } catch (err) {

    console.error('ADMIN ORDERS ERROR:', err);
    
    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load orders.'
    });
  }
}

const getAdminOrderById = async (req, res) => {

  try {
    
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('orderItems.product', 'images');

    if (!order) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Order not found',
        message: 'The requested order could not be found'
      });
    }

    res.render('admin/order-details', {
      layout: 'layouts/admin-layout',
      title: 'Order Details',
      currentPage: 'orders',
      order
    })

  } catch (err) {
    
    console.error('ADMIN ORDER DETAILS ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load order details.'
    });
  }
}

const adminUpdateOrderStatus = async (req, res) => {

  try {
    
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
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

const downloadAdminInvoice = async (req, res) => {

  try {

    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Order Not Found',
        message: 'Order not found.'
      });
    }

    // Razorpay orders must have successful payment
    if (
      order.paymentMethod === 'Razorpay' &&
      order.paymentDetails?.status !== 'Success'
    ) {
      return res.status(400).render('error', {
        layout: false,
        status: 400,
        title: 'Invoice Unavailable',
        message: 'Invoice is not available because payment was not completed.'
      });
    }

    const doc = generateInvoice(order, order.userId);

    res.setHeader(
      'Content-Type',
      'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${order.invoiceNumber}.pdf"`
    );

    doc.pipe(res);
    doc.end();

  } catch (err) {

    console.error('Admin Invoice Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to generate invoice.'
    });

  }
};

module.exports = {
  getAdminOrdersPage,
  getAdminOrderById,
  adminUpdateOrderStatus,
  downloadAdminInvoice
}