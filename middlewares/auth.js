const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const isLoggedIn = async (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {

    if (req.accepts("html")) {
      return res.redirect(
        `/users/login?redirect=${encodeURIComponent(req.originalUrl)}`
      );
    }

    return res.status(401).json({
      message: 'Unauthorized, please login first'
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: 'User not found please login again'
      });
    }

    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      res.clearCookie('token');

      if (req.accepts('html')) {
        return res.redirect(
          `/users/login?redirect=${encodeURIComponent(req.originalUrl)}&message=${encodeURIComponent('Your password was changed. Please login again.')}`
        );
      }
    }

    req.user = decoded;
    next();

  } catch (err) {

    return res.status(401).json({
      message: 'Invalid token, please login again'
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Forbidden, you do not have permission to access this resource'
    });
  }
  next();
};

const checkUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      req.user = null;
      return next();
    }

    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      req.user = null;
      res.clearCookie('token');
      return next();
    }


    req.user = decoded;


  } catch (err) {
    // Invalid/expired token → treat as guest
    req.user = null;
  }
  
  next();
}

module.exports = {
  isLoggedIn,
  isAdmin,
  checkUser
};