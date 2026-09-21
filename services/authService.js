const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail , sendPasswordResetEmail} = require('./emailService');

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

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const verificationExpires = new Date(
    Date.now() + 15 * 60 * 1000
  )

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
    isVerified: false
  });

  const verificationLink = `http://localhost:3000/users/verify-email?token=${verificationToken}`;

  await sendVerificationEmail(email, verificationLink);

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

  if (user.authProvider === 'local' && !user.isVerified) {
    throw new Error('Please verify your email before logging in.');
  }

  return user;
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: {$gt: new Date()}
  });

  if (!user) {
    throw new Error('Invalid or expired verification link');
  }

  user.isVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;

  await user.save();

  return user;
}

const resendVerificationEmail = async (email) => {

  const user = await User.findOne({email, authProvider: 'local'});

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isVerified) {
    throw new Error('This email is already verified');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const verificationExpires = new Date(
    Date.now() + 15 * 60 * 1000
  );

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;

  await user.save();

  const verificationLink = `http://localhost:3000/users/verify-email?token=${verificationToken}`;

  await sendVerificationEmail(email, verificationLink);

  return user;
}

const forgotPassword = async (email) => {
  
  const user = await User.findOne({email, authProvider: 'local'});

  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  const resetExpires = new Date(
    Date.now() + 15 * 60 * 1000
  );

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;

  await user.save();

  const resetLink = `http://localhost:3000/users/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(email, resetLink);
}

const resetPassword = async (token, newPassword) => {

  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new Error('Invalid or expired password reset link');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordChangedAt = new Date();
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();
}

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
};