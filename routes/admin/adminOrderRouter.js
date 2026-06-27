const express = require('express');
const router = express.Router();

const { adminGetAllOrders, adminUpdateOrderStatus } = require('../../controllers/admin/adminOrderController');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');
const validateId = require('../../middlewares/validateId');

router.use(isLoggedIn, isAdmin);

router.get('/',adminGetAllOrders);
router.put('/:id', validateId(), adminUpdateOrderStatus)

module.exports = router;