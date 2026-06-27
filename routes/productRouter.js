const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/adminProductController');

const { productDetails, postReviews } = require('../controllers/user/userProductController');

const { isLoggedIn } = require('../middlewares/auth');
const validateId = require('../middlewares/validateId')

// Route to get all products
router.get('/', getAllProducts);
router.get('/:id',validateId(), productDetails);
router.post('/:id/reviews',isLoggedIn,validateId(), postReviews);

module.exports = router;