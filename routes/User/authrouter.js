const express = require('express');
const router = express.Router();
const User = require('../../models/userSchema');
const { registerUser, loginUser, getLoginPage, logout, loadRegisterPage } = require('../../controllers/authController');


router.get('/register', loadRegisterPage)
router.get("/login", getLoginPage);
router.get('/logout', logout)

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;