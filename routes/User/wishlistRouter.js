const express = require('express');
const router = express.Router();

const { 
  getWishlist,
  addToWishlist, 
  removeFromWishlist, 
  addToCartFromWishlist, 
  clearWishlist,
  removeFromWishlistAjax
 } = require('../../controllers/user/wishlistController');

const { isLoggedIn } = require('../../middlewares/auth');
const validateId = require('../../middlewares/validateId');

router.use(isLoggedIn);

router.get('/', getWishlist)
router.post('/add-to-wishlist/:productId', validateId('productId'), addToWishlist)
router.post('/add-to-cart', addToCartFromWishlist);
router.post('/remove/:productId', validateId('productId'), removeFromWishlist );
router.post('/clear', clearWishlist);
router.post('/remove-from-wishlist/:productId',
  validateId('productId'),
  removeFromWishlistAjax)

module.exports = router