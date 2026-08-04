const Product = require('../../models/productSchema');
const Review = require('../../models/reviewSchema')

const productDetails = async (req, res) => {
  
  try {
   
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews separately
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'name');
    
    res.render("store/product-detail",{
      product,
      reviews,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0
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

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = await Review.findOne({ productId: id, userId });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this product'
      });
    }

    const review = new Review({
      productId: id,
      userId,
      rating: Number(rating),
      comment
    });

    await review.save();

    const allReviews = await Review.find({ productId: id });
    const totalRating =  allReviews.reduce((sum, r) => sum + r.rating, 0);

    product.averageRating = totalRating / allReviews.length;
    product.totalReviews = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    });

  } catch (err) {
    
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  productDetails,
  postReviews
};