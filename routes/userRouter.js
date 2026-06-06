const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const { registerUser } = require('../controllers/user/userController');

router.post('/register', registerUser);

module.exports = router;