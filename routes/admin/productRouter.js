const express = require('express');
const router = express.Router();

const { createProduct } = require('../../controllers/admin/productController');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

router.use(isLoggedIn, isAdmin); // Apply authentication middleware to all routes in this router

router.post('/add-product', createProduct);

module.exports = router;