const Order = require('../../models/orderSchema');
const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');

const getAdminReportsPage = async (req, res) => {

  try {
    
    // total customers
    const totalCustomers = await User.countDocuments({ 
      role: { $ne: 'admin' }
    });

    //total products
    const totalProducts = await Product.countDocuments();

    //total orders
    const totalOrders = await Order.countDocuments();

    //deliverd orders
    const deliveredOrders = await Order.countDocuments({
      status: 'Delivered'
    });

    //cancelled orders
    const cancelledOrders = await Order.countDocuments({
      status: 'Cancelled'
    });

    //returned orders
    const returnedOrders = await Order.countDocuments({
      status: 'Returned'
    });

    //total revenue from deliverd orders
    const revenueResult = await Order.aggregate([
      {
        $match: { status: 'Delivered' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const totalRevenue =
      revenueResult.length > 0 
        ? revenueResult[0].totalRevenue
        : 0;

    //total discount given on deliverd orders
    const discountResult = await Order.aggregate([
      {
        $match: { status: 'Delivered' }
      },
      {
        $group: {
          _id: null,
          totalDiscount: { 
            $sum: {
              $add: ['$discount', '$couponDiscount']
            }
          }
        }
      }
    ]);

    const totalDiscount = 
      discountResult.length > 0
        ? discountResult[0].totalDiscount
        : 0;

    res.render('admin/reports', {
      layout: 'layouts/admin-layout',
      currentPage: 'reports',
      title: 'Reports',
      totalCustomers,
      totalProducts,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      totalRevenue,
      totalDiscount
    });
        
  } catch (err) {
    console.error('Admin Reports Error:', err);

    res.status(500).render('error', {
      message: 'Unable to load reports.'
    });
  }
};

const getSalesReport = async (req, res) => {

  try {
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const range = req.query.range || '30days';
    const startDate = new Date();

    if (range === '7days') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (range === '30days') {
      startDate.setDate(startDate.getDate() - 29);
    } else if (range === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (range === '1year') { 
      startDate.setFullYear(startDate.getFullYear() - 1); 
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.'
      });
    }
    
    startDate.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'Delivered'
        }
      },
      {
        $addFields: {
          reportDate: {
            $convert: {
              input: '$createdAt',
              to: 'date',
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $match: {
          reportDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$reportDate' },
            month: { $month: '$reportDate' },
            day: { $dayOfMonth: '$reportDate' }
          },
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.json({
      success: true,
      startDate,
      endDate,
      salesData
    });

  } catch (err) {
    console.error('Sales Report Error:', err);

    res.status(500).json({
      success: false,
      message: 'Unable to load sales report.'
    });
  }
}

module.exports = {
  getAdminReportsPage,
  getSalesReport
}