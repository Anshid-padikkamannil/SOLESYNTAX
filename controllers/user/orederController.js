const Order = require('../../models/orderSchema');
const { generateInvoice } = require('../../services/invoiceService');
const orderService = require('../../services/orderService');

const createOrder  = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;
    const { addressId, paymentMethod = "COD", couponCode } = req.body || {};

    // 1. Get address and cart
    const { address , cart } = await orderService.getOrderData( userId, addressId );

    if (paymentMethod === 'Razorpay') {
      const existingOrder = await orderService.findReusableRazorpayOrder(userId, cart);

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          orderId: existingOrder._id,
          reused: true
        });
      }
    }

    // 2. Validate product stock
    await orderService.validateCartStock(cart);

    // 3. Build order items and calculate total
    const { orderItems, totalPrice } = orderService.buildOrderItems(cart);

    // 4. Calculate shipping
    const shipping = totalPrice >= 5000 ? 0 : 100;

    // 5. Coupon
    let couponDiscount = 0;
    let couponApplied = false;
    let appliedCouponCode = null;
    let couponId = null;

    if (couponCode) {
      const couponResult = await orderService.applyOrderCoupon(
        userId,
        couponCode,
        cart,
        totalPrice
      );

      couponDiscount = couponResult.couponDiscount;
      couponApplied = couponResult.couponApplied;
      appliedCouponCode = couponResult.appliedCouponCode;
      couponId = couponResult.couponId;
    }

    // 6. Calculate final amount
    const finalAmount =
      totalPrice + shipping - couponDiscount;

    // 7. Validate payment method
    orderService.validatePaymentMethod(paymentMethod);

    // 8. Create order
    const order = await orderService.createOrder({
      userId,
      orderItems,
      totalPrice,
      shipping,
      finalAmount,
      address,
      paymentMethod,
      couponApplied,
      couponCode: appliedCouponCode,
      couponDiscount,
      couponId,
    });

    return res.status(201).json({
      success: true,
      orderId: order._id
    });

  } catch (err) {

    if (err.pendingOrderId) {
      return res.status(400).json({
        success: false,
        message: err.message,
        pendingOrderId: err.pendingOrderId
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

const allOrders =  async (req, res) => {
  try {

    const userId = req.user.userId || req.user._id;

    const result = await orderService.getUserOrders(
      userId,
      req.query.page,
      req.query.limit
    )

    const formattedOrders = result.data.map(order => ({
      id: order._id,
      date: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      total: order.finalAmount,
      status: order.status,
      statusClass: order.status
        .toLowerCase()
        .replace(/\s+/g, "-")
    }));

    res.render("account/index", {
      activeMenu: "orders",
      title: "Orders",
      orders: formattedOrders,
      pagination: result.pagination
    })

  } catch (err) {
    console.error("All Orders Error:", err);

    res.status(500).render("error", {
      message: "This is a test error page."
    });

  }
}

const getOrderById = async (req, res) => {
  
  try {

    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const order = await orderService.getUserOrderById(userId, id);

    if (!order) {
      return res.status(404).render("error", {
        message: "Something went wrong."
      })
    }

    res.render("account/index", {
      activeMenu: "order-details",
      title: "Order Details",
      order
    })
    
  } catch (err) {
    console.error("TEST ERROR:", err);

    res.status(500).render("error", {
      message: "Something went wrong."
    });  
  }
}

const cancelOrder = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;
    const { reason } = req.body || {};

    const order = await orderService.cancelOrder( userId, id, reason);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (err) {
    
    console.error('Cancel Order Error:', err);

    if (err.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
    
  }
}

const downloadInvoice = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId}).populate('orderItems.product');

    if (!order) {
      return res.status(400).render('error', {
        message: 'Order not found.'
      });
    }

    // only generate invoices for valid orders
    if (order.paymentMethod === 'Razorpay' && order.paymentDetails.status !== 'Success') {
      return res.status(400).render('error', {
        message: 'Invoice is not available because payment was not completed.'
      });
    }

    const doc = generateInvoice(order, req.user);

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
    console.error('Invoice Error:', err);

    res.status(500).render('error', {
      message: 'Unable to generate invoice.'
    });
  }
}

module.exports = {
  createOrder,
  allOrders,
  getOrderById,
  cancelOrder,
  downloadInvoice
}