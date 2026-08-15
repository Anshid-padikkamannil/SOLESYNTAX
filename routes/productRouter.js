const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/adminProductController');

const { productDetails, postReviews, getHomePage, getShop } = require('../controllers/user/userProductController');

const { isLoggedIn } = require('../middlewares/auth');
const validateId = require('../middlewares/validateId')

router.get('/', getHomePage);
router.get('/products', getAllProducts);
router.get('/products/:id',validateId(), productDetails);
router.post('/products/:id/reviews',isLoggedIn,validateId(), postReviews);

router.get('/shop', isLoggedIn, getShop);

module.exports = router;