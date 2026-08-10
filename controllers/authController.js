const User = require('../models/userSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const generateTokenAndSetCookie = require('../utils/jwt');

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

module.exports = {
  registerUser,
  loginUser,
  loadRegisterPage,
  getLoginPage,
  logout
};