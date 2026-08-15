const Product = require('../../models/productSchema');
const paginate = require('../../utils/pagination')

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

    const filter = {};

    if (req.query.brand) {
      filter.brand = req.query.brand;

    }

    if (req.query.shoeType) {
      filter.shoeType = req.query.shoeType
    }
    
    if (req.query.category) {
      filter.category = req.query.category
    }

    // if (minPrice || maxPrice) {
    //   filter.price = {};
    //   if (minPrice) filter.price.$gte = Number(minPrice);
    //   if (maxPrice) filter.price.$lte = Number(maxPrice)
    // }

    const result = await paginate(
      Product,
      filter,
      {
        page: req.query.page,
        limit: req.query.limit,
        sort: { price: 1 },
        select: 'productName price images brand'
      }
    )

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

  
}

module.exports = {
  createProduct, 
  getAllProducts,
  updateProduct,
  deleteProduct,
}