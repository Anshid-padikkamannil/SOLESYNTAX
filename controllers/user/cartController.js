const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');


// Add to Cart
const addToCart = async (req, res) => {

  try {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const userId = req.user.userId;

    // Find user's cart
    let cart = await Cart.findOne({ userId: userId });

    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [{ productId: productId, quantity: quantity }]
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.productId && item.productId.toString() === productId
    );

    if (existingItem) {
      // Update quantity if already exists
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId: productId, quantity: quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Product added to cart successfully', cart });



  } catch (err) {
    res.status(500).json({ message: 'Error adding product to cart', error: err.message });
  }

}

module.exports = { 
  addToCart
};