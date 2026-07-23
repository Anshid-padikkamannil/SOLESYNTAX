const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const profileHandler = async (req, res) => {
  res.status(200).json({
    message: 'Welcome to your profile page'
  });
}

const addAddress = async (req, res) => {
  try {

    const userId = req.user.userId || req.user._id;
    const addressData = req.body;

    const addressCount = await Address.countDocuments({ userId });
    if (addressCount >= 5 ) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 addresses allowd'
      });
    } 

    // making the first address as default
    if (addressCount === 0 ) {
      addressData.isDefault = true;
    }

    // If setting as default, remove default from other addresses
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

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    })
    
  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

const getAddresses = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;

    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

const getAddressById = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      address
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
};

const updateAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, remove default from other addresses
    if (updateData.isDefault && !addAddress.isDefault) {
      await Address.updateMany(
        { userId },
        { isDefault: false }
      );
    }

    // Update
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      updateData,
      {new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Address updated Successfully',
      address: updatedAddress
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const setDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id , userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all addresses
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );

    //set this address as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      address
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;

    const address = await Address.findOne({ userId, isDefault: true });
    

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.status(200).json({
      success: true,
      address
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const deleteAddress = async (req, res) => {

  try {
    
    const userId = req.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findByIdAndDelete({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // if delelted address was default set another address as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  profileHandler,
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  getDefaultAddress,
  deleteAddress
};