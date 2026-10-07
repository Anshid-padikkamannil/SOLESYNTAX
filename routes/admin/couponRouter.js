const express = require('express');
const router = express.Router();
const { isLoggedIn ,isAdmin } = require('../../middlewares/auth');

const {

  getAdminCouponsPage,
  getAdminCreateCouponPage,
  getAdminEditCouponPage,
  createCoupon,
  updateCoupon,
  deleteCoupon

} = require('../../controllers/admin/couponController');

router.use( isLoggedIn, isAdmin );

router.get('/', getAdminCouponsPage);

router.get('/new', getAdminCreateCouponPage);
router.post('/', createCoupon);

router.get('/:id/edit', getAdminEditCouponPage);
router.post('/:id', updateCoupon);

router.delete('/:id', deleteCoupon);

module.exports = router;