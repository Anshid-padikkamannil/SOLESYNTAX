// utils/couponHelper.js
const Coupon = require('../models/couponSchema');
const UserCoupon = require('../models/userCouponSchema');

/**
 * Validates a coupon code for a specific user and cart
 * @param {string} couponCode - The coupon code entered by user
 * @param {string} userId - The logged-in user's ID
 * @param {number} cartTotal - Total price of the cart
 * @param {array} productIds - Array of product IDs in the cart
 * @returns {object} - { valid: boolean, message: string, discount: number, finalAmount: number, coupon: object }
 */
const applyCouponValidation = async (couponCode, userId, cartTotal, productIds = []) => {
  // Find coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase().trim()
  });

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  // Check if active
  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }

  // Check expiry
  const now = new Date();
  if (now < coupon.startDate) {
    return { valid: false, message: 'Coupon has not started yet' };
  }
  if (now > coupon.expiryDate) {
    return { valid: false, message: 'Coupon has expired' };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  // Check per-user usage
  const userUsedCount = await UserCoupon.countDocuments({
    userId,
    couponId: coupon._id
  });

  if (userUsedCount >= coupon.perUserLimit) {
    return { valid: false, message: 'You have already used this coupon' };
  }

  // Check minimum order amount
  if (cartTotal < coupon.minimumOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}`
    };
  }

  // Check product eligibility (if applicable)
  if (coupon.applicableProducts.length > 0) {
    const hasApplicable = productIds.some(id =>
      coupon.applicableProducts.includes(id)
    );
    if (!hasApplicable) {
      return { valid: false, message: 'This coupon is not applicable to items in your cart' };
    }
  }

  // Check excluded products
  if (coupon.excludedProducts.length > 0) {
    const hasExcluded = productIds.some(id =>
      coupon.excludedProducts.includes(id)
    );
    if (hasExcluded) {
      return { valid: false, message: 'This coupon cannot be applied to items in your cart' };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  } else { // fixed
    discountAmount = Math.min(coupon.discountValue, cartTotal);
  }

  const finalAmount = cartTotal - discountAmount;

  return {
    valid: true,
    message: 'Coupon is valid',
    discount: discountAmount,
    finalAmount: finalAmount,
    coupon: coupon
  };
};

/**
 * Applies coupon to order and records usage
 * This is a wrapper for the validation function that also saves usage
 */
const applyCouponToOrder = async (orderData, userId, couponCode, productIds, cartTotal) => {
  if (!couponCode) {
    return {
      applied: false,
      discount: 0,
      finalAmount: cartTotal,
      couponApplied: false,
      couponCode: null
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

  // Record usage
  const userCoupon = new UserCoupon({
    userId,
    couponId: result.coupon._id,
    discountAmount: result.discount
  });
  await userCoupon.save();

  // Update coupon used count
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
};

module.exports = {
  applyCouponValidation,
  applyCouponToOrder
};