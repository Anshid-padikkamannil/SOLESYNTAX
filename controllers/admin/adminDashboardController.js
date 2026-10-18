const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Order = require('../../models/orderSchema');

const getAdminDashboard = async (req, res) => {

  try {

    const now = new Date();

    const startOfCurrentMonth = new Date( now.getFullYear(), now.getMonth(), 1);

    const startOfPreviousMonth = new Date( now.getFullYear(), now.getMonth() -1, 1);

    const elapsedDays = now.getDate() - 1;

      const previousMonthLastDay = new Date(
        startOfPreviousMonth.getFullYear(),
        startOfPreviousMonth.getMonth() + 1,
        0
      ).getDate();

      const previousPeriodEnd = new Date(
        startOfPreviousMonth.getFullYear(),
        startOfPreviousMonth.getMonth(),
        Math.min(elapsedDays + 1, previousMonthLastDay + 1)
      );
    
    const totalCustomers = await User.countDocuments({ role: 'user' });

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    //new customers registered this month
    const currentMonthCustomers = await User.countDocuments({
      role: 'user',
      createdAt: {
        $gte: startOfCurrentMonth,
        $lt: now
      }
    });

    const previousMonthCustomers = await User.countDocuments({
      role: 'user',
      createdAt: {
        $gte: startOfPreviousMonth,
        $lt: previousPeriodEnd
      }
    });

    //new products added each month
    const currentMonthProducts = await Product.countDocuments({
      createdAt: {
        $gte: startOfCurrentMonth,
        $lt: now
      }
    });

    const previousMonthProducts = await Product.countDocuments({
      createdAt: {
        $gte: startOfPreviousMonth,
        $lt: previousPeriodEnd
      }
    });

    //orders created each month
    const currentMonthOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfCurrentMonth,
        $lt: now
      }
    });

    const previousMonthOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfPreviousMonth,
        $lt: previousPeriodEnd
      }
    });

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0 ) {
        return current === 0 ? 0 : null;
      }

      return Math.round(((current - previous) / previous) * 100);
    };

    const customerChange = calculatePercentageChange(
      currentMonthCustomers,
      previousMonthCustomers
    );

    const productChange = calculatePercentageChange(
      currentMonthProducts,
      previousMonthProducts
    );

    const orderChange = calculatePercentageChange(
      currentMonthOrders,
      previousMonthOrders
    );

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

    const currentMonthPendingOrders = await Order.countDocuments({
      status: 'Pending',
      createdAt: {
        $gte: startOfCurrentMonth,
        $lt: now
      }
    });

    const previousMonthPendingOrders = await Order.countDocuments({
      status: 'Pending',
      createdAt: {
        $gte: startOfPreviousMonth,
        $lt: previousPeriodEnd
      }
    });

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const revenueByPeriod = async (startDate, endDate) => {
      const result = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ['Processing', 'Shipped', 'Delivered']
            },
            createdAt: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$finalAmount'}
          }
        }
      ]);

      return result.length > 0 ? result[0].total : 0;
    }

    const currentMonthRevenue = await revenueByPeriod(
      startOfCurrentMonth,
      now
    );

    const previousMonthRevenue = await revenueByPeriod(
      startOfPreviousMonth,
      previousPeriodEnd
    );

    const revenueChange = calculatePercentageChange(
      currentMonthRevenue,
      previousMonthRevenue
    );

    const pendingOrderChange = calculatePercentageChange(
      currentMonthPendingOrders,
      previousMonthPendingOrders
    );

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
      user: res.locals.user,
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      customerChange,
      productChange,
      orderChange,
      revenueChange,
      pendingOrderChange,
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