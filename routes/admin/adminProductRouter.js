const express = require('express');
const router = express.Router();
const upload = require('../../config/multer');

const { 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAdminProductsPage,
  getAddProductPage,
  getEditProductPage,
  deleteProductImage
} = require('../../controllers/admin/adminProductController');

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const validateId = require('../../middlewares/validateId')

router.use(isLoggedIn, isAdmin); // Apply authentication middleware to all routes in this router

router.get('/', getAdminProductsPage);

router.get('/add-product', getAddProductPage);
router.post('/add-product', upload.array('images', 5), createProduct);

router.get('/edit-product/:id', validateId(), getEditProductPage);
router.put('/update-product/:id', validateId(), upload.array('images', 5), updateProduct);
router.delete('/:id/images', validateId(), deleteProductImage);

router.delete('/delete-product/:id', validateId(),deleteProduct);

module.exports = router;