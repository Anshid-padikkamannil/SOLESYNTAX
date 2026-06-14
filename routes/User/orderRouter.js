const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middlewares/auth')

const { createOrder, allOrders, getOrderById  } = require('../../controllers/user/orederController');

router.use(isLoggedIn)

router.post('/', createOrder);
router.get('/', allOrders)
router.get('/:id',getOrderById)


module.exports = router;