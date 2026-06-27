const express = require('express');
const router = express.Router();

const { getWishlist, addToWishlist, removeFromWishlist  } = require('../../controllers/user/wishlistController');

const { isLoggedIn } = require('../../middlewares/auth');
const validateId = require('../../middlewares/validateId');

router.use(isLoggedIn);

router.get('/', getWishlist)
router.post('/add-to-wishlist', addToWishlist)
.delete('/remove/:productId', validateId(), removeFromWishlist )

module.exports = router