const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middlewares/auth')

const { createOrder } = require('../../controllers/user/orederController');

router.post('/', isLoggedIn, createOrder);


module.exports = router;