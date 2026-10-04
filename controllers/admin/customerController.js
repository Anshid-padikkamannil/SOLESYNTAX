const User = require('../../models/userSchema');
const paginate = require('../../utils/pagination');
const Order = require('../../models/orderSchema');
const Address = require('../../models/addressSchema');

const getAdminCustomersPage = async (req, res) => {
  try {
    
    const result = await paginate(
      User,
      { role: 'user' },
      {
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 },
        select: '-password'
      }
    );

    res.render('admin/customers', {
      layout: 'layouts/admin-layout',
      title: 'Customsers',
      currentPage: 'customers',
      customers: result.data,
      pagination: result.pagination
    })

  } catch (err) {
    
    console.error('ADMIN CUSTOMERS ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load customers.'
    });

  }
};

const getCustomerById = async (req, res) => {
  
  try {
    
    const { id } = req.params;

    const customer = await User.findOne({ _id : id, role: 'user' }). select('-password');

    if (!customer) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Customer Not Found',
        message: 'The requested customer could not be found'
      });
    }

    const result = await paginate(
      Order,
      { userId: customer._id},
      {
        page: req.query.page,
        limit: req.query.limit || 10,
        sort: { createdAt: -1 }
      }
    );

    const addresses = await Address.find({
      userId: customer._id
    }).sort({ isDefault: -1, createdAt: -1 });

    res.render('admin/customer-details', {
      layout: 'layouts/admin-layout',
      title: 'Customer-Details',
      currentPage: 'customers',
      customer,
      orders: result.data,
      pagination: result.pagination,
      addresses
    });

  } catch (err) {
    
    console.error('ADMIN CUSTOMER DETAILS ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to load customer details.'
    });
  }
}

const toggleCustomerBlock = async (req, res) => {

  try {
    
    const { id } = req.params;

    const customer = await User.findOne({ _id: id, role: 'user' });

    if (!customer) {
      return res.status(404).render('error', {
        layout: false,
        status: 404,
        title: 'Customer Not Found',
        message: 'The requested customer could not be found'
      });
    }

    customer.isBlocked = !customer.isBlocked;

    await customer.save();

    res.redirect(`/admin/customers/${customer._id}`);

  } catch (err) {
    
    console.error('TOGGLE CUSTOMER BLOCK ERROR:', err);

    res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Unable to update customer status.'
    });

  }
};

module.exports = {
  getAdminCustomersPage,
  getCustomerById,
  toggleCustomerBlock
}