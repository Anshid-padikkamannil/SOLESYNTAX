const Review = require('../../models/reviewSchema');
const User = require('../../models/userSchema');
const Product = require('../../models/userSchema');
const paginate = require('../../utils/pagination');

const getReviewsPage = async (req, res) => {

  try {

    const filter = {};

    if (req.query.status === 'hidden') {
      filter.status = 'hidden';
    } else if (req.query.status === 'published') {
      filter.status = { $ne: 'hidden' };   // include legacy docs w/o status
    }

    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating, 10);
    }

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search.trim(), 'i');

        const [matchingUsers, matchingProducts] = await Promise.all([
        User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select('_id'),
        
        Product.find({ name: searchRegex }).select('_id')
        
      ]);

      const userIds = matchingUsers.map(u => u._id);
      const productIds = matchingProducts.map(p => p._id);

      filter.$or = [
        { comment: searchRegex },
        { userId: { $in: userIds }},
        { productId: { $in: productIds} }
      ];
    }

    
    const result = await paginate(
      Review,
      filter,
      {
        page: req.query.page || 1,
        limit: req.query.limit || 5,
        sort: { createdAt: -1 },
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'productId', select: 'productName images' }
        ]
      }
    );

    res.render('admin/reviews', {
      layout: 'layouts/admin-layout',
      currentPage: 'reviews',
      title: 'Reviews',
      reviews: result.data,
      pagination: result.pagination,
      search: req.query.search || '',
      statusFilter: req.query.status || '',
      ratingFilter: req.query.rating || ''
    })

  } catch (err) {
    console.error('Admin Reviews Error:', err);

    res.status(500).render('error', {
      message: 'Unable to load reviews.'
    });
  }
};

const updateReviewStatus = async (req, res) => {

  try {
    
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully'
    });

  } catch (err) {
    console.error('Update Review Status Error:', err);

    res.status(500).json({
      success: false,
      message: 'Unable to update review status.'
    });
  }
}

module.exports = {
  getReviewsPage,
  updateReviewStatus
}