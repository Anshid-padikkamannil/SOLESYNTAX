const Product = require('../../models/productSchema');
const Review = require('../../models/reviewSchema');
const productService = require('../../services/productService');

const productDetails = async (req, res) => {
  
  try {
   
    const { product, reviews } = await productService.getProductDetails(req.params.id);
    
    res.render("store/product-detail",{
      product,
      reviews,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      layout: false
    });
    
  } catch (err) {
    
    res.status(500).json({ message: err.message });

  }
}

const postReviews = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params; // Product Id
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating is required and must be between 1 to 5'
      });
    }

    const result = await productService.addProductReview(userId, id, rating, comment);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: result.review,
      averageRating: result.averageRating,
      totalReviews: result.totalReviews
    });

  } catch (err) {
    
    console.error("Post Review Error:", err);

    if (err.message === 'Product not found' || err.message === 'You have already reviewed this product') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  productDetails,
  postReviews
};