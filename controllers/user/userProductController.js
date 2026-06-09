const Product = require('../../models/productSchema');

const productDetails = async (req, res) => {
  

  const product = await Product.findById(req.params.id);
  res.json(product);
}

module.exports = {
  productDetails
};