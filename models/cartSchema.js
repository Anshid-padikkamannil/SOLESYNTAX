const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    size: {  // ← ADD THIS
      type: Number,
      enum: [5, 6, 7, 8],
    },  
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }]
},
{
  timestamps: true
}
);

module.exports = mongoose.model('Cart', cartSchema);