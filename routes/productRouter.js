const express = require('express');
const router = express.Router();

const { getAllProducts } = require('../controllers/admin/productController');

// Route to get all products
router.get('/', getAllProducts);

module.exports = router;