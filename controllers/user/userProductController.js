const Product = require('../../models/productSchema');
const productService = require('../../services/productService');
const wishlistService = require('../../services/wishlistService');

const getShop = async (req, res) => {

  try {

    const { brand, shoeType, category, search, priceRange, page, limit} = req.query;

    const result = await productService.getAllProducts(
      {
        brand,
        shoeType,
        category,
        search,
        priceRange
      },
      {
        page,
        limit
      }
    );

    const userId = req.user.userId || req.user._id;

    const wishlistProductIds = await wishlistService.getWishlistProductIds(userId);

    return res.render('store/shop', {
      layout: false,
      title: 'shop',
      products: result.data,
      pagination: result.pagination,
      search: req.query.search || '',
      category: req.query.category || '',
      shoeType: req.query.shoeType || '',
      priceRange: req.query.priceRange || '',
      wishlistProductIds
    });

  } catch (err) {
    console.error('GET SHOP ERROR:', err);

    return res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while loading the shop.'
    });

  }

  
}

const productDetails = async (req, res) => {
  
  try {
   
    const { product, reviews } = await productService.getProductDetails(req.params.id);

    const userId = req.user.userId || req.user._id;

    const wishlistProductIds = await wishlistService.getWishlistProductIds(userId);
    
    res.render("store/product-detail",{
      product,
      reviews,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      wishlistProductIds,
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

    if (
      err.message === 'Product not found' || 
      err.message === 'You have already reviewed this product' || 
      err.message === 'You can only review products you have purchased') {
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

const getProductReviews = async (req, res) => {
  try {
    
    const { id } = req.params;

    const reviews = await productService.getProductReviews(id);

    res.status(200).json({
      success: true,
      reviews
    });


  } catch (err) {
    console.error("Get Product Reviews Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getHomePage = async (req, res) => {
  try {
    
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(16);

    const userId = req.user.userId || req.user._id;

    const wishlistProductIds = await wishlistService.getWishlistProductIds(userId);
      
      
    res.render("store/index", {
      products,
      wishlistProductIds,
      layout: false
    })

  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = {
  getShop,
  productDetails,
  postReviews,
  getProductReviews,
  getHomePage
};