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


  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: "after" }
  );

  res.json(product);
}

const deleteProduct = async (req, res) => {

  const product = await Product.findByIdAndDelete(req.params.id);

  res.json(product);
}

const getAllProducts = async (req, res) => {

  const products = await Product.find();

  res.json(products);
}

module.exports = {
  createProduct, 
  getAllProducts,
  updateProduct,
  deleteProduct
}