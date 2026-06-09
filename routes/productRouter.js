const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/adminProductController');
const { productDetails } = require('../controllers/user/userProductController');

// Route to get all products
router.get('/', getAllProducts);
router.get('/:id', productDetails);

module.exports = router;