const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct } = require('../../controllers/admin/adminProductController');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

router.use(isLoggedIn, isAdmin); // Apply authentication middleware to all routes in this router

router.post('/add-product', createProduct);
router.put('/update-product/:id', updateProduct);
router.delete('/delete-product/:id', deleteProduct);

module.exports = router;