const Product = require('../../models/productSchema');

// Create a new product
const createProduct = async (req, res) => {

  try {
    const product = await Product.create(req.body);

    res.status(201).json({ message: 'Product created successfully', product });


  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
}

module.exports = {
  createProduct
}