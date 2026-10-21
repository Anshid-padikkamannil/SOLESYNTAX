const Coupon = require('../../models/couponSchema');
const paginate = require('../../utils/pagination');
const Product = require('../../models/productSchema');

const getAdminCouponsPage = async (req, res) => {
  try {

    const filter = {};
    const now = new Date();

    if (req.query.search) {
      const search = req.query.search.trim();

      filter.code = { $regex: search, $options: 'i'};
    }

    const statusFilter = req.query.status;
    if (statusFilter === 'active') {
      filter.isActive = true;
      filter.startDate = { $lte: now };
      filter.expiryDate = { $gte: now };
    } else if (statusFilter === 'expired') {
      filter.expiryDate = { $lt: now };
    } else if (statusFilter === 'upcoming') {
      filter.startDate = { $gt: now };
    } else if (statusFilter === 'inactive') {
      filter.isActive = false;
    }
    
    const result = await paginate(
      Coupon,
      filter,
      {
        page: req.query.page,
        limit: req.query.limit || 5,
        sort: { createdAt: -1 }
      }
    );

    res.render('admin/coupons', {
      layout: 'layouts/admin-layout',
      title: 'Coupons',
      currentPage: 'coupons',
      coupons: result.data,
      pagination: result.pagination,
      search: req.query.search || '',
      statusFilter: req.query.status || ''
    });

  } catch (err) {
    
    console.error('ADMIN COUPONS ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load coupons.'
    });
  }
};

const getAdminCreateCouponPage = async (req, res) => {

  try {
    
    const products = await Product.find(
      {},
      'productName category price'
    ).sort({ productName: 1 });

    res.render('admin/coupon-form', {
      layout: 'layouts/admin-layout',
      title: 'Add Coupon',
      currentPage: 'coupons',
      products,
      isEdit: false
    });
    
  } catch (err) {

    console.error('ADMIN CREATE COUPON PAGE ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load coupon form.'
    });
    
  }
}

const createCoupon = async (req, res) => {

  try {
    const couponData = req.body;
    couponData.code = couponData.code.toUpperCase().trim();

    const existingCoupon = await Coupon.findOne({ code: couponData.code });

    if (existingCoupon) {
      return res.status(400).render('error', {
        layout: false,
        status: 400,
        title: 'Coupon Error',
        message: 'Coupon code already exists.'
      });
    }

    // -----------------------------
    // Normalize array fields
    // -----------------------------

    if (couponData.applicableCategories) {
      
      couponData. applicableCategories = 
        Array.isArray(couponData.applicableCategories)
        ? couponData.applicableCategories
        : [couponData.applicableCategories];

    } else {
      couponData.applicableCategories = [];
    }

    if (couponData.applicableProducts) {
      
      couponData. applicableProducts = 
        Array.isArray(couponData.applicableProducts)
        ? couponData.applicableProducts
        : [couponData.applicableProducts];
        
    } else {
      couponData.applicableProducts = [];
    }

    if (couponData.excludedProducts) {
      
      couponData. excludedProducts = 
        Array.isArray(couponData.excludedProducts)
        ? couponData.excludedProducts
        : [couponData.excludedProducts];
        
    } else {
      couponData.excludedProducts = [];
    }

    // userEligibility is also an array
    if (couponData.userEligibility) {
      
      couponData. userEligibility = 
        Array.isArray(couponData.userEligibility)
        ? couponData.userEligibility
        : [couponData.userEligibility];
        
    } else {
      couponData.excludedProducts = [];
    }

    // checkbox is not sent when unchecked
    couponData.isActive = couponData.isActive === 'true';

    //empty optional numeric values should become null
    if (couponData.maximumDiscountAmount === '') {
      couponData.maximumDiscountAmount = null;
    }

    if (couponData.usageLimit === '') {
      couponData.usageLimit = null;
    }

    const coupon = new Coupon({
      ...couponData,
      createdBy: req.user.userId
    });

    await coupon.save();

    res.redirect('/admin/coupons');

  } catch (err) {
    
    console.error('CREATE ADMIN COUPON ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to create coupon.'
    });
  }
};

const getAdminEditCouponPage = async (req, res) => {
  
  try {
    
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Coupon Not Found',
        message: 'The requested coupon could not be found.'
      });
    }

    const products = await Product.find(
      {},
      'productName category price'
    ).sort({
      productName: 1
    });

    res.render('admin/coupon-form', {
      layout: 'layouts/admin-layout',
      currentPage: 'coupons',
      title: 'Edit Coupon',
      coupon,
      products,
      isEdit: true
    })

  } catch (err) {

    console.error('ADMIN EDIT COUPON PAGE ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load coupon.'
    });
  }
}

const updateCoupon = async (req, res) => {
  try {
    
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }

    if (updateData.applicableCategories) {

      if (!Array.isArray(updateData.applicableCategories)) {
        updateData.applicableCategories = [
          updateData.applicableCategories
        ];
      }

    } else {
      updateData.applicableCategories = [];
    }

    if (updateData.applicableProducts) {

      if (!Array.isArray(updateData.applicableProducts)) {
        updateData.applicableProducts = [
          updateData.applicableProducts
        ];
      }

    } else {
      updateData.applicableProducts = [];
    }

    if (updateData.excludedProducts) {

      if (!Array.isArray(updateData.excludedProducts)) {
        updateData.excludedProducts = [
          updateData.excludedProducts
        ];
      }

    } else {
      updateData.excludedProducts = [];
    }

    // Checkbox
    // If unchecked, browser sends nothing.
    updateData.isActive = updateData.isActive === 'true';

    if (updateData.userEligibility) {

      if (!Array.isArray(updateData.userEligibility)) {
        updateData.userEligibility = [
          updateData.userEligibility
        ];
      }

    } else {
      updateData.userEligibility = ['all'];
    }

    if (updateData.maximumDiscountAmount === '') {
      updateData.maximumDiscountAmount = null;
    }

    if (updateData.usageLimit === '') {
      updateData.usageLimit = null;
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (! coupon) {
      return res.status(404).render('error', {
        layout: false,
        message: 'Coupon not found.'
      });
    }

    res.redirect('/admin/coupons');


  } catch (err) {
    
    console.error('Update Admin Coupon Error:', err);
    
    res.status(500).render('error', {
      message: 'Unable to update coupon.'
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message

    })
  }
}

module.exports = {
  getAdminCouponsPage,
  getAdminCreateCouponPage,
  getAdminEditCouponPage,
  createCoupon,
  updateCoupon,
  deleteCoupon
}