const User = require('../models/userSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const generateTokenAndSetCookie = require('../utils/jwt');
const authService = require('../services/authService');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists, please login instead'
      });
    }

    // changed for better user experience / after registering no need for login
    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // from util
    generateTokenAndSetCookie(user, res);
    
    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {

    return res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    
    const { email, password } = req.body;
  
    const user = await User.findOne({email: email});

    if (!user) {
      return res.status(401).json({
        message: 'Email is INVALID'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password is INVALID"
      });
    }  
    generateTokenAndSetCookie(user, res);

    res.status(200).json({ 
      message: 'User logged in successfully'
    });
    

  } catch (err) {
    
  }
  
}

const loadRegisterPage = (req, res) => {
  res.render("auth/register", { layout: false });
}

const getLoginPage = (req, res) => {

  const redirect = req.query.redirect || "/";

  res.render("auth/login", {
    redirect,
    layout: false
  });
}

const logout = (req, res) => {
  
  try {
    
    res.clearCookie("token");
    res.redirect('/')

  } catch (err) {
    
  }
}

const changePassword = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;

    const {currentPassword, newPassword, confirmPassword} = req.body;

    // required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('All password fields are required.')
      );
    }

    // minmun length
    if (newPassword.length < 8) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password must be at least 8 characters.')
      );
    }

    //confirm password
    if (newPassword !== confirmPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password and confirm password do not match.')
      );
    }

    //prevent same password
    if (currentPassword === newPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password must be different from your current password.')
      );
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    return res.redirect(
      '/account/change-password?success=' +
      encodeURIComponent('Password changed successfully.')
    );

  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);

    return res.redirect(
      '/account/change-password?error=' +
      encodeURIComponent(err.message)
    );
  }
}

const getPasswordPage = async (req, res) => {

  const error = req.query.error || null;
  const success = req.query.success || null;

  res.render('account/index', {
    activeMenu: 'change-password',
    title: 'Change Password',
    error,
    success
  });
};

module.exports = {
  registerUser,
  loginUser,
  loadRegisterPage,
  getLoginPage,
  logout,
  changePassword,
  getPasswordPage
};