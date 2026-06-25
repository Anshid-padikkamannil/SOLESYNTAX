const User = require('../../models/userSchema');
const paginate = require('../../utils/pagination');

const getAllCustomer = async (req, res) => {
  try {
    
    const result = await paginate(
      User,
      {},
      {
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 },
        select: '-password'
      }
    );

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getAllCustomer
}