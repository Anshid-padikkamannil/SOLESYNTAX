const Coupon = require('../../models/couponSchema');
const UserCoupon = require('../../models/userCouponSchema');
const Order = require('../../models/orderSchema');
const { applyCouponValidation } = require('../../utils/couponHelper');

const validateCoupon = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { couponCode, cartTotal, productIds } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        meassge: 'Coupon code is required'
      });
    }

    const result = await applyCouponValidation(
      couponCode,
      userId,
      cartTotal,
      productIds
    );

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        mesasge: result.meassge
      });
    }

    res.status(200).json({
      success: true,
      message: result.discount,
      finalAmount: result.finalAmount
    });


  } catch (err) {
    
    res.status(500).json({
      success: false,
      meassgae: err.meassgae
    });
  }
};

/*// ---------- Helper Function for Validation ----------

const applyCouponValidation = async (couponCode, userId, cartTotal, productIds =[]) => {

  //Find coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase().trim()
  });

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  //check if active
  if (!coupon.isActive) {
    return { valid: false, meassge: 'Coupon is not active' };
  }

  //check expiry
  const now = new Date();
  if (now < coupon.startDate) {
    return { valid: false, meassgae: 'Coupon has not started yet' };
  }

  if (now > coupon.expiryDate) {
    return { valid: false, meassgae: 'Coupon has expired' };
  }

  //check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  //check per-uer usage
  const userUsedCount = await UserCoupon.countDocuments({
    userId,
    couponId: coupon._id
  });

  if (userUsedCount >= coupon.perUserLimit) {
    return { valid: false, meassage: 'You have already use this coupon' };
  }

  //chekc minimum order amout
  if (cartTotal < coupon.minimumOrderAmount) {
    return {
      valid: false,
      meassgae: `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}`
    };
  }

  //check product eligiblity (if applicable)
  if (coupon.applicableProducts.length > 0) {
    const hasApplicable = productIds.some(id =>
      coupon.applicableProducts.includes(id)
    );
    if (!hasApplicable) {
      return { valid: false, meassgae: 'This coupon is not applicalbe to items in your cart'};
    }
  }

  //check excluded products
  if (coupon.excludedProducts.length > 0) {
    const hasExcluded = productIds.some(id =>
      coupon.excludedProducts.includes(id)
    );
    if (hasExcluded) {
      return { valid: false, message: 'This coupon cannot be applied to items in your cart'};
    }
  }

  // calculate discount 
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, cartTotal);
  }

  const finalAmount = cartTotal - discountAmount;

  return {
    valid: true,
    meassgae: 'Coupon is valid',
    discount: discountAmount,
    finalAmount: finalAmount,
    coupon: coupon
  };
};

// ---------- Apply Coupon in Order ----------

// this will be called from createOrder controller
const applyCouponToOrder = async (orderData, userId, couponCode, productIds, cartTotal) => {
  if (!couponCode) {
    return {
      applied: false,
      discount: 0,
      finalAmount: cartTotal,
      couponApplied: false,
      couponcode: null
    };
  }

  const result = await applyCouponValidation(
    couponCode,
    userId,
    cartTotal,
    productIds
  );

  if (!result.valid) {
    throw new Error(result.message);
  }

  // Record usege
  const userCoupon = new UserCoupon({
    userId,
    couponId: result.coupon._id,
    discountAmount: result.discount
  });

  await userCoupon.save();

  //Update coupon used count 
  await Coupon.findByIdAndUpdate(result.coupon._id, {
    $inc: { usedCount: 1 }
  });

  return {
    applied: true,
    discount: result.discount,
    finalAmount: result.finalAmount,
    couponApplied: true,
    couponCode: couponCode,
    couponDiscount: result.discount,
    couponId: result.coupon._id
  };
};*/

module.exports = {
  validateCoupon
}