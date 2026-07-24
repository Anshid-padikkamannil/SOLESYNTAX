const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscountAmount: {
    type: Number,
    default: null // null = no limit
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1 //how many times a single user can use this coupon
  },
  applicableCategories: {
    type: [String],
    default: [] // empty = all categories
  },
  applicableProducts: {
    type: [Schema.Types.ObjectId],
    ref: 'Product',
    default: []
  },
  excludedProducts: {
    type: [Schema.Types.ObjectId],
    ref: 'Product',
    default: []
  },
  userEligibility: {
    type: [String],
    enum: ['all', 'new', 'existing'],
    default: ['all']
  } ,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

//indexes for faster lookup
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);