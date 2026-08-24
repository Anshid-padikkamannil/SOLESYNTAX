const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const {
  addItemToCart,
  getUserCart,
  updateCartItem : updateCartItemService,
  removeCartItem : removeCartItemService,
} = require('../../services/cartService')


// Add to Cart
const addToCart = async (req, res) => {

  try {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const size = Number(req.body.size)
    const userId = req.user.userId || req.user._id;

   
    const cart = await addItemToCart(
      userId,
      productId,
      quantity,
      size
    );
    res.status(200).json({ message: 'Product added to cart successfully', cart });



  } catch (err) {
    res.status(500).json({ message: 'Error adding product to cart', error: err.message });
  }

}

const getCart = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;


    const result = await getUserCart(userId);

    if (!result) {
      return res.render("store/cart", {
        cart: null,
        layout: false
      });        
    }
    
    
    res.render("store/cart", {
      cart: result.cart,
      subtotal: result.subtotal,
      layout: false
    });

  } catch (err) {

    console.error("Get Cart Error:", err);

    res.status(500).json({
      message: 'Error fetching cart',
      error: err.message
    });  
  }
}

const updateCartItem = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId, size } = req.params;
    const { quantity } = req.body;

    const cart = await updateCartItemService(
      userId,
      productId,
      size,
      Number(quantity)
    );

    res.status(200).json({ message: 'Cart item updated successfully', cart });



  } catch (err) {

    res.status(400).json({ success: false, message: err.message});

  }
}

const removeCartItem = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;
    const { productId, size } = req.params;

    const cart = await removeCartItemService(
      userId,
      productId,
      size
    );

    res.status(200).json({ message: 'Cart item removed successfully', cart});

  } catch (err) {

    res.status(500).json({ message: err.message});

  }

}

const clearCart = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;
    await clearCart( userId );

    res.status(200).json({
      message: 'Cart cleared successfully'
    })

  } catch (err) {

    res.status(500).json({ message: err.message})
  }
}

module.exports = { 
  addToCart,
  getCart, 
  updateCartItem,
  removeCartItem,
  clearCart
};