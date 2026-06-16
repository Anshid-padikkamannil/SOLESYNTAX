const express = require('express');
const router = express.Router();

const { adminGetAllOrders, adminUpdateOrderStatus } = require('../../controllers/admin/adminOrderController');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

router.use(isLoggedIn, isAdmin);

router.get('/',adminGetAllOrders);
router.put('/:id',adminUpdateOrderStatus)

module.exports = router;