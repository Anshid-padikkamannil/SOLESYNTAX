const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const Cart = require('../../models/cartSchema');


// Add to Cart
const addToCart = async (req, res) => {

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

      return res.status(201).json({
        message: "Product added to cart successfully.",
        cart
      });
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
    res.status(200).json({ message: 'Product added to cart successfully', cart });



  } catch (err) {
    res.status(500).json({ message: 'Error adding product to cart', error: err.message });
  }

}

const getCart = async (req, res) => {

  try {
    const userId = req.user.userId || req.user._id;
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId', 'productName description category brand price');

    if (!cart ||cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({cart });

  } catch (err) {

    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
}

const updateCartItem = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found'});
    }

    const item = cart.items.find(
      item => item.productId && item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    item.quantity = quantity;

    /*cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.quantity * item.productId.price);
    }, 0);*/

    await cart.save();
    res.status(200).json({ message: 'Cart item updated successfully', cart });



  } catch (err) {

    res.status(500).json({ message: err.message});

  }
}

const removeCartItem = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found'})
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ message: 'Cart item removed successfully', cart});

  } catch (err) {

    res.status(500).json({ message: err.message});

  }

}

const clearCart = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;
    await Cart.findOneAndDelete({ userId});

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