const express = require('express');
const router = express.Router();
const User = require('../../models/userSchema');
const { registerUser, loginUser } = require('../../controllers/user/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;