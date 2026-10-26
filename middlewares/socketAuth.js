const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const socketAuth = async (Socket, next) => {
  try {
    const token = Socket.request.cookies?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const  user = await User.findById( decoded.userId);

    if (!user){
      return next(new Error('User not found'));
    }

    if (user.isBlocked) {
      return next(new Error('Account is blocked'));
    }

    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return next(new Error('Please log in again'));
    }

    if (user.role !== 'admin') {
      return next(new Error('Admin access required'));
    }

    Socket.data.userId = user._id.toString();
    Socket.data.role = user.role;

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
}

module.exports = socketAuth;