const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/adminProductController');

const { productDetails, postReviews } = require('../controllers/user/userProductController');

const { isLoggedIn } = require('../middlewares/auth')

// Route to get all products
router.get('/', getAllProducts);
router.get('/:id', productDetails);
router.post('/:id/reviews',isLoggedIn, postReviews);

module.exports = router;