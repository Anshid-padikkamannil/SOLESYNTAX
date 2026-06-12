const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
      type: Number
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