const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  orderItems: [{
    product: {
      type: Schema.Types.ObjectId,
      ref:'Product',
      required: true
    },
    size: {
      type: Number,
      enum: [5, 6, 7, 8],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: String,
    productImage: [String],
    returnStatus: {
      type: String,
      enum: ['Not Requested', 'Requested', 'Approved', 'Rejected', 'Completed'],
      default: 'Not Requested'
    },
    cancelStatus: {
      type: String,
      enum: ['Completed', 'Cancelled'],
      default: 'Completed'
    },
    returnReason: String,
    returnRequestedAt: Date 
  }],
  totalPrice: { type: Number, required: true, min: 0 },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    addressType: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    landMark: String,
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    phone: { type: String, required: true },
    altPhone: String
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Razorpay', 'wallet'],
    default: 'COD'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned'],
    default: 'Pending'
  },
  discount: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  couponApplied: { type: Boolean, default: false },
  couponCode: String
},
{
  timestamps:true
}
);

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;