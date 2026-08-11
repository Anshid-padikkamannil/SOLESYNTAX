const express = require('express');
const router = express.Router();

const {
  dashboard,
  profile,
  updateProfile,
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  getDefaultAddress,
  deleteAddress

} = require('../../controllers/user/profileController');

const { allOrders, getOrderById } = require('../../controllers/user/orederController');

const { getAccountWishlist, accountAddToCartFromWishlist, accountRemoveFromWishlist } = require('../../controllers/user/wishlistController');

const { getAccountCoupon } = require('../../controllers/user/couponController');

const { isLoggedIn } = require('../../middlewares/auth');
router.use(isLoggedIn);

router.get('/account', dashboard);

router.get('/account/profile', profile);
router.post('/account/profile/update', updateProfile);

router.get('/account/orders', allOrders);
router.get('/account/order-details/:id', getOrderById);

//address
router.post('/account/address', addAddress);
router.get('/account/addresses', getAddresses);
router.get('/address/:id', getAddressById);
router.post('/account/address/:id/update', updateAddress);
router.post('/account/address/:id/default', setDefaultAddress);
router.get('/account/address/default', getDefaultAddress);
router.post('/account/address/:id/delete', deleteAddress);

router.get('/account/wishlist', getAccountWishlist);
router.post('/account/wishlist/add-to-cart', accountAddToCartFromWishlist);
router.post('/account/wishlist/remove/:productId', accountRemoveFromWishlist);

router.get('/account/coupons', getAccountCoupon);


module.exports = router;