const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middlewares/auth');
const validateId = require('../../middlewares/validateId');

const { createOrder, allOrders, getOrderById, cancelOrder  } = require('../../controllers/user/orederController');

router.use(isLoggedIn)

router.post('/', createOrder);
router.get('/', allOrders);
router.get('/:id', validateId(), getOrderById);
router.put('/:id/cancel', validateId(), cancelOrder);


module.exports = router;