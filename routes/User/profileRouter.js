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
router.post('/account/address/:id/delete', deleteAddress)


module.exports = router;