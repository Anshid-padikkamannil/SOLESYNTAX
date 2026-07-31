const jwt = require('jsonwebtoken');

const attachUser = (req, res, next) => {
  
  const token = req.cookies.token;
  
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.locals.user = decoded;

  } catch (err) {
    
    res.locals.user = null;

  }

  next();
};

module.exports = attachUser;

// this is for to access user in all ejs!