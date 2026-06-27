const mogoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 */

const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mogoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} fromat`
      });
    }

    next();
  };
};

module.exports = validateId;