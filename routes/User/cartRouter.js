const express = require('express');
const router = express.Router();

const Cart = require('../../models/cartSchema');
const Product = require('../../models/productSchema');

const { addToCart, getCart, updateCartItem, removeCartItem, clearCart } = require('../../controllers/user/cartController');

const { isLoggedIn } = require('../../middlewares/auth');
const validateId = require('../../middlewares/validateId');

router.use(isLoggedIn);

router.post('/add-to-cart', addToCart);
router.get('/', getCart);
router.put('/update/:productId',validateId(), updateCartItem);
router.delete('/remove/:productId', validateId(),removeCartItem)
router.delete('/remove', clearCart);

module.exports = router;