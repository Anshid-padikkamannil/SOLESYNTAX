const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Order = require('../../models/orderSchema');

const getAdminDashboard = async (req, res) => {

  try {
    
    const totalCustomers = await User.countDocuments({ role: 'user' });

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: 'Pending'});

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: {
            $in: ['Processing', 'Shipped', 'Delivered']
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: '$finalAmount'
          }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1})
      .limit(5)
      .populate('userId', 'name email');

    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .select('productName stock images')
      .sort({ stock: 1 })
      .limit(5)

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      currentPage: "dashboard",
      user: req.user,
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      layout: 'layouts/admin-layout'
    });

  } catch (err) {
    
    console.error('ADMIN DASHBOARD ERROR:', err);

    return res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while loading the admin dashboard.'
    });
  }
};

module.exports = {
  getAdminDashboard
};