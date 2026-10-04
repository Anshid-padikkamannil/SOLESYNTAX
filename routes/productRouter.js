const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/adminProductController');

const { productDetails, postReviews, getHomePage, getShop, getProductReviews } = require('../controllers/user/userProductController');

const { isLoggedIn, checkUser } = require('../middlewares/auth');
const validateId = require('../middlewares/validateId')

router.get('/',checkUser, getHomePage);
router.get('/products', getAllProducts);
router.get('/products/:id',isLoggedIn, checkUser, validateId(), productDetails);
router.post('/products/:id/reviews',isLoggedIn,validateId(), postReviews);
router.get('/products/:id/reviews', getProductReviews);

router.get('/shop', isLoggedIn, getShop);

module.exports = router;