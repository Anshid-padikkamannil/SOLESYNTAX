const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

const changePassword = async (userId, currentPassword, newPassword) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Google users may not have a password
  if (!user.password) {
    throw new Error('This account does not have a password');
  }

  // Check current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Save new password
  user.password = hashedPassword;

  await user.save();

  return true;
};

const registerUser = async (name, email, password) => {

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error('User already exists, please login instead');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return user;
};

const loginUser = async (email, password) => {

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error('Email is INVALID');
  }

  if (user.authProvider === 'google') {
    throw new Error('This account uses Google login. Please continue with Google.')
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Password is INVALID');
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  changePassword
};