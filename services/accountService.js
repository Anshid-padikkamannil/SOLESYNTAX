const Address = require('../models/addressSchema');
const User = require('../models/userSchema');
const Order = require('../models/orderSchema');
const Wishlist = require('../models/wishlistSchema');


// Add Address
const addAddress = async (userId, addressData) => {

  const addressCount = await Address.countDocuments({ userId });

  // Maximum 5 addresses per user
  if (addressCount >= 5) {
    throw new Error('Maximum 5 addresses allowed');
  }

  // First address automatically becomes default
  if (addressCount === 0) {
    addressData.isDefault = true;
  }

  // If this address is being set as default,
  // remove default from all other addresses
  if (addressData.isDefault) {
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );
  }

  const address = new Address({
    userId,
    ...addressData
  });

  await address.save();

  return address;
};


// Get All Addresses
const getAddresses = async (userId) => {

  return await Address.find({ userId })
    .sort({
      isDefault: -1,
      createdAt: -1
    });
};


// Get Address By ID
const getAddressById = async (userId, addressId) => {

  return await Address.findOne({
    _id: addressId,
    userId
  });
};


// Update Address
const updateAddress = async (userId, addressId, updateData) => {

  const address = await Address.findOne({
    _id: addressId,
    userId
  });

  if (!address) {
    return null;
  }

  // If changing this address to default,
  // remove default from other addresses
  if (updateData.isDefault && !address.isDefault) {
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );
  }

  const updatedAddress = await Address.findOneAndUpdate(
    {
      _id: addressId,
      userId
    },
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  return updatedAddress;
};


// Set Default Address
const setDefaultAddress = async (userId, addressId) => {

  const address = await Address.findOne({
    _id: addressId,
    userId
  });

  if (!address) {
    return null;
  }

  // Remove default from all addresses
  await Address.updateMany(
    { userId },
    { isDefault: false }
  );

  // Set selected address as default
  address.isDefault = true;

  await address.save();

  return address;
};


// Get Default Address
const getDefaultAddress = async (userId) => {

  return await Address.findOne({
    userId,
    isDefault: true
  });
};


// Delete Address
const deleteAddress = async (userId, addressId) => {

  const address = await Address.findOneAndDelete({
    _id: addressId,
    userId
  });

  if (!address) {
    return null;
  }

  // If deleted address was default,
  // make another address default
  if (address.isDefault) {

    const nextAddress = await Address.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return address;
};

const updateProfile = async (userId, profileData) => {

  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  user.name = profileData.name;
  user.phone = profileData.phone;

  await user.save();

  return user;
};

const getDashboardData = async (userId) => {

  const [
    user,
    totalOrders,
    pendingOrders,
    savedAddresses,
    wishlist,
    recentOrder
  ] = await Promise.all([

    User.findById(userId),

    Order.countDocuments({
      userId
    }),

    Order.countDocuments({
      userId,
      status: "Pending"
    }),

    Address.countDocuments({
      userId
    }),

    Wishlist.findOne({
      userId
    }),

    Order.findOne({
      userId
    }).sort({
      createdAt: -1
    })

  ]);

  const wishlistItems = wishlist?.products?.length || 0;

  return {
    user,
    totalOrders,
    pendingOrders,
    savedAddresses,
    wishlistItems,
    recentOrder
  };
};


module.exports = {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  getDefaultAddress,
  deleteAddress,
  updateProfile,
  getDashboardData
};