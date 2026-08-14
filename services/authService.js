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

module.exports = {
  changePassword
};