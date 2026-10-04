const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

const validateId = require('../../middlewares/validateId');

const { 
  getAdminCustomersPage,
  getCustomerById,
  toggleCustomerBlock
} = require('../../controllers/admin/customerController');

router.use( isLoggedIn, isAdmin );

router.get('/customers', getAdminCustomersPage);
router.get('/customers/:id', validateId(), getCustomerById);
router.post('/customers/:id/toggle-block', validateId(), toggleCustomerBlock);

module.exports = router;