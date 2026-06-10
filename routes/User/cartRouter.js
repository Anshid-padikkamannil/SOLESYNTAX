const express = require('express');
const router = express.Router();

const Cart = require('../../models/cartSchema');
const Product = require('../../models/productSchema');

const { addToCart, getCart, updateCartItem, removeCartItem, clearCart } = require('../../controllers/user/cartController');

const { isLoggedIn } = require('../../middlewares/auth');

router.use(isLoggedIn);

router.post('/add-to-cart', addToCart);
router.get('/', getCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeCartItem)
router.delete('/remove', clearCart);

module.exports = router;