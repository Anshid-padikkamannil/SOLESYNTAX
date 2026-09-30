const express = require('express');
const router = express.Router();
const { isLoggedIn ,isAdmin } = require('../../middlewares/auth');

const {

  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon

} = require('../../controllers/admin/couponController');

router.use( isLoggedIn, isAdmin );

router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;