const Wishlist = require('../models/wishlistSchema');
const Product = require('../models/productSchema');
const paginate = require('../utils/pagination');


// Get user's wishlist with populated products
const getWishlistData = async (userId, page, limit) => {
  return await paginate(
    Wishlist,
    { userId },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'products.productId'
    }
  );
};


// Add product to wishlist
const addWishlistItem = async (userId, productId) => {

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({
      userId,
      products: [{ productId }]
    });
  } else {

    const exists = wishlist.products.some(
      item => item.productId.toString() === productId
    );

    if (exists) {
      throw new Error('Product already in wishlist');
    }

    wishlist.products.push({ productId });
  }

  await wishlist.save();

  return wishlist;
};


// Remove product from wishlist
const removeWishlistItem = async (userId, productId) => {

  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
      throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
      item => item.productId.toString() !== productId
  );

  await wishlist.save();

  return wishlist;
};


module.exports = {
  getWishlistData,
  addWishlistItem,
  removeWishlistItem
};