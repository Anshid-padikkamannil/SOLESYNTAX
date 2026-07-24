const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middlewares/auth');

const {

  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon

} = require('../../controllers/admin/couponController');

router.use( isAdmin );

router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;