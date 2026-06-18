const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedOn: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

wishlistSchema.index({ userId: 1, 'products.productId': 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;