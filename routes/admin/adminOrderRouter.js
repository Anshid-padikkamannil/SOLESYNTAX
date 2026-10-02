const express = require('express');
const router = express.Router();

const { 
  getAdminOrdersPage,
  getAdminOrderById, 
  adminUpdateOrderStatus,
  downloadAdminInvoice
} = require('../../controllers/admin/adminOrderController');

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const validateId = require('../../middlewares/validateId');

router.use(isLoggedIn, isAdmin);

router.get('/',getAdminOrdersPage);
router.get('/:id/invoice', validateId(), downloadAdminInvoice);
router.get('/:id', validateId(), getAdminOrderById);

router.put('/:id', validateId(), adminUpdateOrderStatus)

module.exports = router;