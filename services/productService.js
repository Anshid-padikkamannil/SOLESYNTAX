const Product = require('../models/productSchema');
const Review = require('../models/reviewSchema');

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

module.exports = {
  getProductDetails,
  addProductReview
};