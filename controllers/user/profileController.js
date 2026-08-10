const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const Order = require('../../models/orderSchema');
const wishlist = require('../../models/wishlistSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Wishlist = require('../../models/wishlistSchema');

const dashboard = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;


    const [
      user,
      totalOrders,
      pendingOrders,
      savedAddresses,
      wishlist,
      recentOrder
    ] = await Promise.all([
      User.findById(userId),
      Order.countDocuments({ userId }),
      Order.countDocuments({
      userId,
      status: "Pending"
      }),
      Address.countDocuments({ userId }),
      Wishlist.findOne({ userId }),
      Order.findOne({ userId })
        .sort({ createdAt: -1 })

      ]);

      const wishlistItems = wishlist?.products?.length || 0;

      let formattedRecentOrder = null;

      if (recentOrder) {
        formattedRecentOrder = {
          id: recentOrder.orderId,
          date: new Date(recentOrder.createdAt).toLocaleDateString("en-IN",{
            day: "numeric",
            month: "short",
            year: "numeric"
          }),
          total: recentOrder.finalAmount,
          status: recentOrder.status? recentOrder.status.toLowerCase().replace(/\s+/g, "-") : "unknown"
        };
      }

      res.render("account/index", {
        activeMenu: "dashboard",
        title: "SOLESYNTAX",
        user,
        totalOrders,
        pendingOrders,
        savedAddresses,
        wishlistItems,
        recentOrder: formattedRecentOrder
      });

  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

const profile = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id

    const user = await User.findById( userId );

    if (!user) {
      return res.redirect("/users/login");
    }
    
    res.render("account/index", {
      activeMenu: "profile",
      title: "profile",
      user

    })

  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
}

const updateProfile = async (req, res) => {

  try {

    const userId = req.user.userId || req.user._id;

    const { name, phone} = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/users/login");
    }

    user.name = name;
    user.phone = phone;

    await user.save();
    
    res.redirect("/account/profile");

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);

    res.status(500).render("error", {
      message: "Something went wrong"
    });   
  }
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

    res.redirect("/account/addresses");
    
    
  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
}

const getAddresses = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;

    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1
    });

    res.render("account/index", {
      activeMenu: "addresses",
      title: "Addresses",
      addresses
    });

  } catch (err) {
    console.error("Get Addresses Error:", err);

    res.status(500).render("error", {
      layout: false,
      status: 500,
      title: "Server Error",
      message: "Something went wrong while loading your addresses."
    });

  }
};

const getAddressById = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
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
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
      });
    }

    // If setting as default, remove default from other addresses
    if (updateData.isDefault && !address.isDefault) {
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

    res.redirect("/account/addresses");

  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

const setDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findOne({ _id: id , userId });

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
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

    res.redirect("/account/addresses");

  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

const getDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;

    const address = await Address.findOne({ userId, isDefault: true });
    

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
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
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await Address.findByIdAndDelete({ _id: id, userId });

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
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

    res.redirect("/account/addresses");

  } catch (err) {
    console.error(err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

module.exports = {
  dashboard,
  profile,
  updateProfile,
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  getDefaultAddress,
  deleteAddress
};