const Wishlist = require('../../models/wishlistSchema');
const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const paginate = require('../../utils/pagination');

const getWishlist = async (req, res) => {

  try {
  
    const userId = req.user.userId || req.user._id;

    const result = await paginate(
      Wishlist,
      { userId },
      {
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 },
        populate: 'products.productId'
      }
    )

    res.json({ 
      success: true,
      ...result
    });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
};

const addToWishlist = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
        return res.status(400).json({ message: 'Product already in wishlist'});
      }

      wishlist.products.push({ productId });
    }

    await wishlist.save();
    res.status(200).json({ success: true, wishlist });

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
} 

const removeFromWishlist = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found'});
    }

    wishlist.products = wishlist.products.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();
    res.json({ success: true, message: 'Removed form wishlist'});

  } catch (err) {

    res.status(500).json({ message: err.message });
    
  }
}

const getAccountWishlist = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;

    const result = await getWishlistData(
      userId,
      req.query.page,
      req.query.limit
    );

    const wishlist = result.data[0] || null;


    res.render("account/index", {
      activeMenu: "wishlist",
      title: "Wishlist",
      wishlist,
      pagination: result.pagination
    });

  } catch (err) {
    console.error("Account Wishlist Error:", err);

    res.status(500).render("error", {
      layout: false,
      status: 500,
      title: "Server Error",
      message: "Something went wrong while loading your wishlist."
    });
  }
}

const accountAddToCartFromWishlist = async (req, res) => {
  try {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const size = Number(req.body.size)
    const userId = req.user.userId || req.user._id;

   
    //added
    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'size is required available sizes:...'
      })
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1."
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Quantity Validation
    const max_per_order = 10;
    const allowedQuantity = Math.min(max_per_order, product.stock);

    if (quantity > allowedQuantity ) {
      return res.status(400).json({
        message: `you can only purchase up to ${allowedQuantity} items(s).`
      })
    }


    // Find user's cart
    let cart = await Cart.findOne({ userId: userId });

    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{  productId, quantity, size}]
      });

      await cart.save();

      await Wishlist.updateOne({ userId},
        {
          $pull: {
            products: {
              productId: productId
            }
          }
        }
      )

      return res.redirect('/account/wishlist');
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId &&
      item.size === size
    );

    if (existingItem) {
      // Update quantity if already exists
      const newQuantity = existingItem.quantity += quantity;

      if (newQuantity > allowedQuantity) {
        return res.status(400).json({
          success: false,
          message: `You can only purchase up to ${allowedQuantity} items(s).`
        });
      }

      existingItem.quantity = newQuantity;

    } else {
      // Add new item
      cart.items.push({ productId, quantity, size });
    }

    await cart.save();

    await Wishlist.updateOne(
      { userId },
      {
        $pull: {
          products: { productId: productId }
        }
      }
    );
    res.redirect('/account/wishlist');



  } catch (err) {
    console.error('Account Wishlist Add To Cart Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while adding the product to your cart.'
    });  
  }
}

const accountRemoveFromWishlist = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    await removeWishlistItem(userId, productId);

    res.redirect('/account/wishlist');

  } catch (err) {
    console.error('Account Remove Wishlist Error:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while removing the product.'
    });
  }
}

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
  )
}

const removeWishlistItem = async (userId, productId) => {

  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    throw new Error('Wihslist not found');
  }

  wishlist.products = wishlist.products.filter(
    item => item.productId.toString() !== productId
  );

  await wishlist.save();

  return wishlist;
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAccountWishlist,
  accountAddToCartFromWishlist,
  accountRemoveFromWishlist
}