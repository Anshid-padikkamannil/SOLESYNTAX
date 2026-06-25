const Wishlist = require('../../models/wishlistSchema');
const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const paginate = require('../../utils/pagination');

const getWishlist = async (req, res) => {

  try {
  
    const userId = req.user.userId || req.user._id;

    const result = await paginate(
      Wishlist,
      { userId },
      {
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 },
        populate: 'product.productId'
      }
    )

    res.json({ 
      success: true,
      ...result
    });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
};

const addToWishlist = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [{ productId }]
      });
    } else {
      const exists = wishlist.products.some(
        item => item.productId.toString() === productId
      );

      if (exists) {
        return res.status(400).json({ message: 'Product already in wishlist'});
      }

      wishlist.products.push({ productId });
    }

    await wishlist.save();
    res.status(200).json({ success: true, wishlist });

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
} 

const removeFromWishlist = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found'});
    }

    wishlist.products = wishlist.products.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();
    res.json({ success: true, message: 'Removed form wishlist'});

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
} 

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist 
}