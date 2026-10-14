const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); // adjust path if needed

const attachUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select('name email role profilePicture googleProfilePicture');

    res.locals.user = user || null;
  } catch (err) {
    res.locals.user = null;
  }

  next();
};

module.exports = attachUser;

// this is for to access user in all ejs!