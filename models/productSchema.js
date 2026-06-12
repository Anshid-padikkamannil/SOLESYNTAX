const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Men",
      "Women"
    ]
  },
  brand: {
    type: String,
    required: true
  },
  shoeType: {
    type: String,
    enum: [
      "Running",
      "Casual",
      "Sneakers",
      "Basketball",
      "Training",
      "Formal"
    ],
    required: true
  },
  sizes: [
    {
      type: Number,
      enum: [5, 6, 7, 8]
    }
  ],
  images: [
    {
      type: String
    }
  ],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true
  }
  
},
{
  timestamps: true
}

);

module.exports = mongoose.model('Product', productSchema);