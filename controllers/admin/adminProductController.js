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

const updateProduct = async (req, res) => {

  try {

    const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: "after" }
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(200).json({
      message: 'Product updated successfully',
      product
    });

  } catch (err) {

    res.status(500).json({ message: error.message });

  }
}

const deleteProduct = async (req, res) => {

  try {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ 
      message: 'Product deleted successfully',
      product
    });
  } catch (err) {

    res.status(500).json({ message: err.message });

  }
  
}

const getAllProducts = async (req, res) => {

  try {

    const products = await Product.find();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });

  }

  
}

module.exports = {
  createProduct, 
  getAllProducts,
  updateProduct,
  deleteProduct
}