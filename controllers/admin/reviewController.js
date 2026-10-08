const Review = require('../../models/reviewSchema');

const getReviewsPage = async (req, res) => {

  try {
    
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('productId', 'productName images')
      .sort({ createdAt: -1 });

    res.render('admin/reviews', {
      layout: 'layouts/admin-layout',
      currentPage: 'reviews',
      title: 'Reviews',
      reviews
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