const Coupon = require('../../models/couponSchema');
const UserCoupon = require('../../models/userCouponSchema');
const Order = require('../../models/orderSchema');

const createCoupon = async (req, res) => {

  try {
    const couponData = req.body;
    couponData.code = couponData.code.toUpperCase().trim();

    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code alrady exists'
      });
    }

    const coupon = new Coupon({
      ...couponData,
      createdBy: req.user.userId
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 
    });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });

  } catch (err) {
  
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (! coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });


  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message

    })
  }
}

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon
}