const paymentService = require('../services/paymentService');

// create order endpoint
const createRazorpayOrder = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;
    const { orderId } = req.body;  // out internal app order id

    //basic validation
    if (!orderId ) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Delegate the heavy work to the service
    const result = await paymentService.createRazorpayOrder(orderId, userId);

    res.status(201).json({
      success: true,
      ...result
    });


  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// verify payment endpoint
const verifyPayment = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const payload = {
      ...req.body,
      userId // attach userId to the payload for the service to use
    };

    //basic validation for required fields
    const required = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'appOrderId'];
    for (const field of required) {
      if (!payload[field]) {
        return res. status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    //delegate to the service
    const result = await paymentService.verifyPayment(payload);

    res.status(200).json(result);


  } catch (err) {
    
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
}