const Wishlist = require('../../models/wishlistSchema');
const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const paginate = require('../../utils/pagination');
const {
  getWishlistData,
  addWishlistItem,
  removeWishlistItem
} = require('../../services/wishlistService');
const { addItemToCart } = require('../../services/cartService');

const getWishlist = async (req, res) => {

  try {
  
    const userId = req.user.userId || req.user._id;

    const result = await getWishlistData(
      userId,
      req.query.page,
      req.query.limit
      
    )
    const wishlist = result.data[0] || null;

    res.render("store/wishlist", {
      layout: false,
      title: "Wishlist",
      wishlist,
      pagination: result.pagination
    });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
};

const addToWishlist = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const productId = req.params.productId;

    const wishlist = await addWishlistItem(userId, productId);

    res.status(200).json({ success: true, wishlist });

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
} 

const removeFromWishlist = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    await removeWishlistItem(userId, productId);

    return res.redirect('/wishlist');

  } catch (err) {

    console.error(' Remove Wishlist Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while removing the product.'
    });
    
  }
}

const removeFromWishlistAjax = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    await removeWishlistItem(userId, productId);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (err) {
    console.error('Remove Wishlist AJAX Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const clearWishlist = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;

    await Wishlist.findOneAndDelete({ userId });

    res.redirect('/wishlist');

  } catch (err) {

    console.error(' Clear Wishlist Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while removing the product.'
    });
  }
}

const addToCartFromWishlist = async (req, res) => {
  try {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const size = Number(req.body.size)
    const userId = req.user.userId || req.user._id;

   
    await addItemToCart(userId, productId, quantity, size);

    await removeWishlistItem(userId, productId);

    res.redirect('/wishlist');


  } catch (err) {
    console.error(' Wishlist Add To Cart Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while adding the product to your cart.'
    });  
  }
}

const getAccountWishlist = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;

    const result = await getWishlistData(
      userId,
      req.query.page,
      req.query.limit
    );

    const wishlist = result.data[0] || null;


    res.render("account/index", {
      activeMenu: "wishlist",
      title: "Wishlist",
      wishlist,
      pagination: result.pagination
    });

  } catch (err) {
    console.error("Account Wishlist Error:", err);

    res.status(500).render("error", {
      layout: false,
      status: 500,
      title: "Server Error",
      message: "Something went wrong while loading your wishlist."
    });
  }
}

const accountAddToCartFromWishlist = async (req, res) => {
  try {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const size = Number(req.body.size)
    const userId = req.user.userId || req.user._id;

   
    await addItemToCart(userId, productId, quantity, size);

    await removeWishlistItem(userId, productId);

    res.redirect('/account/wishlist');


  } catch (err) {
    console.error('Account Wishlist Add To Cart Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while adding the product to your cart.'
    });  
  }
}

const accountRemoveFromWishlist = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    await removeWishlistItem(userId, productId);

    res.redirect('/account/wishlist');

  } catch (err) {
    console.error('Account Remove Wishlist Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while removing the product.'
    });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addToCartFromWishlist,
  clearWishlist,
  getAccountWishlist,
  accountAddToCartFromWishlist,
  accountRemoveFromWishlist,
  removeFromWishlistAjax
}