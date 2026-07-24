const mongoose = require('mongoose');
const { Schema } = mongoose;

const userCouponSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  discountAmount: {
    type: Number,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

userCouponSchema.index({ userId: 1, couponId: 1}, { unique: true });

module.exports = mongoose.model('UserCoupon', userCouponSchema);