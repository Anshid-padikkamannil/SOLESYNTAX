const Product = require('../../models/productSchema');
const paginate = require('../../utils/pagination');
const fs = require('fs');
const path = require('path');

// Create a new product
const createProduct = async (req, res) => {

  try {
    const imagePaths = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

    const productData = {
      ...req.body,
      images: imagePaths
    };

    if(req.body.sizes) {
      productData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes.map(Number) : [Number(req.body.sizes)];
    } else {
      productData.sizes = [];
    }

    const product = await Product.create(productData);

    res.status(201).json({ message: 'Product created successfully', product });


  } catch (err) {

    console.error('CREATE PRODUCT ERROR:', err);

    res.status(500).json({
      message: err.message
    });

  }
}

const updateProduct = async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

  if (!product) {

    // Clean up uploaded files if product doesn't exist
    if (req.files?.length) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return res.status(404).json({ message: 'Product not found' });
  }

  // chekc total image count 
  const existingImageCount = product.images.length;
  const newImageCount = req.files?.lenth || 0;

  if (existingImageCount + newImageCount > 5) {
    //delete newly uploaded files
    if (req.files?.length) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return res.status(400).json({
      message: `Product can have a maximum of 5 images Current images: ${existingImageCount} You tried to add ${newImageCount}`
    })
  }

  const updateData = {
    productName: req.body.productName,
    description: req.body.description,
    category: req.body.category,
    brand: req.body.brand,
    shoeType: req.body.shoeType,
    price: Number(req.body.price),
    stock: Number(req.body.stock)
  }

  //convert sizes
  if (req.body.sizes) {
    updateData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes.map(Number) : [Number(req.body.sizes)];

  } else {
    updateData.sizes = [];
  }

  //add newly uploaded images
  if (req.files && req.files.length > 0) {

    const newImages = req.files.map(
      file => `/images/${file.filename}`
    );

    product.images.push(...newImages);
  }

  if (product.images.length > 5) {
    return res.status(400).json({
      message: 'A product can have a mximum of 5 images'
    });
  }

  Object.assign(product, updateData);

  await product.save();

  res.status(200).json({
    message: 'Product updated successfully',
    product
    });

  } catch (err) {

    console.error('UPDATE PRODUCT ERROR:', err);

    // Clean up uploaded files if something fails
    if (req.files?.length) {

      req.files.forEach(file => {

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

      });

    }

    res.status(500).json({ message: err.message });

  }
}

const deleteProduct = async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    //delete prodcut images from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../../public', image.replace(/^\/+/, ''));

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    //delete product from db
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Product deleted successfully',
      product
    });
  } catch (err) {

    console.error('DELETE PRODUCT ERROR:', err);
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

const getAdminProductsPage = async (req, res) => {

  try {
    
    const  { data: products, pagination } = await paginate(Product, {}, {
      page: req.query.page || 1,
      limit: req.query.limit || 5,
      sort: { createdAt: -1 }
    })

    res.render('admin/products', {
      title: 'Products',
      currentPage: 'products',
      user: req.user,
      products,
      pagination,
      layout: 'layouts/admin-layout'
    });

  } catch (err) {

    console.error('ADMIN PRODUCTS PAGE ERROR:', err);

    return res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while loading products.'
    });

  }  
};

const getAddProductPage = async (req, res) => {

  res.render('admin/add-product', {
    title: 'Add Product',
    currentPage: 'products',
    user: req.user,
    layout: 'layouts/admin-layout'
  });
  
};

const getEditProductPage = async (req, res) => {
  try {
    
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Product Not Found',
        message: 'The product you are trying to edit does not exist'
      });
    }

    res.render('admin/edit-product', {
      title: 'Edit Product',
      currentPage: 'products',
      user: req.user,
      product,
      layout: 'layouts/admin-layout'
    });

  } catch (err) {
    
    console.error('EDIT PRODUCT PAGE ERROR:', err);

    return res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while loading the product.'
    });
  }
}

const deleteProductImage = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        message: 'Image path is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    //chekc that the image actually belongs to this product
    if (!product.images.includes(image)) {
      return res.status(404).json({
        message: 'Image not found for this product'
      });
    }

    // remove image path from db
    product.images = product.images.filter(
      existingImage => existingImage !== image
    );

    await product.save();

    // delete physical file 
    const imagePath = path.join(__dirname,'../../public', image.replace(/^\/+/, ''));

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfuly'
    });

  } catch (err) {
    
    console.error('DELETE PRODUCT IMAGE ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createProduct, 
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAdminProductsPage,
  getAddProductPage,
  getEditProductPage,
  deleteProductImage
}