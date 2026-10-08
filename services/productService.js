const Product = require('../models/productSchema');
const Review = require('../models/reviewSchema');
const Order = require('../models/orderSchema');
const paginate = require('../utils/pagination');


const getAllProducts = async (filtersOptions = {}, pagination = {}) => {

  const filter = {};

  const { brand, shoeType, category, search, priceRange } = filtersOptions;

  if (brand) {
    filter.brand = brand;
  }

  if (shoeType) {
    filter.shoeType = shoeType;
  }

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.productName = {
      $regex: search,
      $options: 'i'
    };
  }

  if (priceRange === 'under-5000') {
    filter.price = { $lt: 5000};
  }

  if (priceRange === '5000-6000') {
    filter.price = {
      $gte: 5000,
      $lt: 6000
    }
  }

  if (priceRange === '6000-7500') {
    filter.price = {
      $gte: 6000,
      $lte: 7500
    }
  }

  if (priceRange === 'above-7500') {
    filter.price = { $gt: 7500};
  }

  const result = await paginate(
    Product,
    filter,
    {
      page: pagination.page,
      limit: pagination.limit,
      sort: { price: 1 },
      select: 'productName price images brand shoeType category stock averageRating totalReviews'
    }
  );

  return result;
};

const getProductDetails = async (productId) => {

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const reviews = await Review.find({
    productId: product._id
  }).populate('userId', 'name');

  return {
    product,
    reviews
  };
};

const addProductReview = async (userId, productId, rating, comment) => {

  // Check product
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const purchased = await Order.findOne({
    userId,
    status: 'Delivered',
    'orderItems.product': productId
  });

  if (!purchased) {
    throw new Error('You can only review products you have purchased');
  }

  // Check existing review
  const existingReview = await Review.findOne({
    productId,
    userId
  });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  // Create review
  const review = new Review({
    productId,
    userId,
    rating: Number(rating),
    comment
  });

  await review.save();

  // Get all reviews
  const allReviews = await Review.find({
    productId
  });

  // Calculate rating
  const totalRating = allReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating = totalRating / allReviews.length;
  const totalReviews = allReviews.length;

  // Update product
  product.averageRating = averageRating;
  product.totalReviews = totalReviews;

  await product.save();

  return {
    review,
    averageRating,
    totalReviews
  };
};

const getProductReviews = async (productId) => {
  
  const reviews = await Review.find({ productId, status: 'published' })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  return reviews;
}

module.exports = {
  getAllProducts,
  getProductDetails,
  addProductReview,
  getProductReviews
};