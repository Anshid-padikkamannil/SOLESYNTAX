const express = require('express');
const router = express.Router();

const { getWishlist, addToWishlist, removeFromWishlist  } = require('../../controllers/user/wishlistController');

const { isLoggedIn } = require('../../middlewares/auth');

router.use(isLoggedIn);

router.get('/', getWishlist)
router.post('/add-to-wishlist', addToWishlist)
.delete('/remove/:productId', removeFromWishlist )

module.exports = router