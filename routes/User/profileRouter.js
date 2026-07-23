const express = require('express');
const router = express.Router();

const {

  profileHandler,
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  getDefaultAddress,
  deleteAddress

} = require('../../controllers/user/profileController');

const { isLoggedIn } = require('../../middlewares/auth');
router.use(isLoggedIn);

router.get('/profile', profileHandler);

//address
router.post('/address', addAddress);
router.get('/address', getAddresses);
router.get('/address/:id', getAddressById);
router.put('/address/:id', updateAddress);
router.put('/address/:id/default', setDefaultAddress);
router.get('/address/default', getDefaultAddress);
router.delete('/address/:id', deleteAddress)


module.exports = router;