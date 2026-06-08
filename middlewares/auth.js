const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, please login first'
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

module.exports = {
  isLoggedIn,
  isAdmin
};