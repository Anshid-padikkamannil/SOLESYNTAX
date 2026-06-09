const express = require('express');
const router = express.Router();

const Cart = require('../../models/cartSchema');
const Product = require('../../models/productSchema');

const { addToCart } = require('../../controllers/user/cartController');

const { isLoggedIn } = require('../../middlewares/auth');

router.post('/add-to-cart', isLoggedIn, addToCart);

module.exports = router;