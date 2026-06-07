const express = require('express');
const router = express.Router();
const User = require('../../models/userSchema');
const { profileHandler } = require('../../controllers/user/profileController');
const { isLoggedIn } = require('../../middlewares/auth');

router.get('/profile', isLoggedIn, profileHandler);

module.exports = router;