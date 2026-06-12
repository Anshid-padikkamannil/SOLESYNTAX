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
    prodcut: {
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
      required: ture,
      man: 0
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
      enum: ['Cmopleted', 'Cancelled'],
      default: 'Completed'
    },
    returnReson: String,
    returnRequestedAt: Date 
  }],

});

// Index for faster queries
orderSchema.index({ userId: 1, createdOn: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;