const Coupon = require('../models/couponSchema');
const UserCoupon = require('../models/userCouponSchema');

const getCouponsForUser = async (userId) => {

  const coupons = await Coupon.find({
    isActive: true
  }).sort({ expiryDate: 1 });

  const usedCoupons = await UserCoupon.find({
    userId
  }).select('couponId');

  const usedCouponIds = new Set(
    usedCoupons.map(item => item.couponId.toString())
  );

  const now = new Date();

  return coupons.map(coupon => {

    const isUsed = usedCouponIds.has(coupon._id.toString());
    const isExpired = now > coupon.expiryDate;
    const notStarted = now < coupon.startDate;

    let status;
    let statusBadge;

    if (isUsed) {
        status = 'Used';
        statusBadge = 'Used';
    } else if (isExpired) {
        status = 'Expired';
        statusBadge = 'Expired';
    } else if (notStarted) {
        status = 'Upcoming';
        statusBadge = 'Upcoming';
    } else {
        status = 'Available';
        statusBadge = 'Available';
    }

    let discount;

    if (coupon.discountType === 'percentage') {
        discount = `${coupon.discountValue}% OFF`;
    } else {
        discount = `₹${coupon.discountValue.toLocaleString('en-IN')} OFF`;
    }

    return {
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discount,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      status,
      statusBadge,
      isUsed,
      isExpired
    };
  });
};

module.exports = {
  getCouponsForUser
};