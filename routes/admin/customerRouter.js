const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');
const { getAllCustomer } = require('../../controllers/admin/customerController');

router.use( isLoggedIn, isAdmin );

router.get('/customers', getAllCustomer);

module.exports = router;