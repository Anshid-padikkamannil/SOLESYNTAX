const User = require('../../models/userSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const profileHandler = async (req, res) => {
  res.status(200).json({
    message: 'Welcome to your profile page'
  });
}

module.exports = {  profileHandler };