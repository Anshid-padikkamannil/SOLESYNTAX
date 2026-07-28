const express = require('express');
const router = express.Router();

const { getAllProducts, getHomePage } = require('../controllers/admin/adminProductController');

const { productDetails, postReviews } = require('../controllers/user/userProductController');

const { isLoggedIn } = require('../middlewares/auth');
const validateId = require('../middlewares/validateId')

router.get('/', getHomePage);
router.get('/products', getAllProducts);
router.get('/products/:id',validateId(), productDetails);
router.post('/products/:id/reviews',isLoggedIn,validateId(), postReviews);

module.exports = router;