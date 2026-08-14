const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const Order = require('../../models/orderSchema');
const wishlist = require('../../models/wishlistSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Wishlist = require('../../models/wishlistSchema');
const accountService = require('../../services/accountService');

const dashboard = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;


    const data = await accountService.getDashboardData(userId);

      let formattedRecentOrder = null;

      if (data.recentOrder) {
      formattedRecentOrder = {
        id: data.recentOrder._id,
        date: new Date(data.recentOrder.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        total: data.recentOrder.finalAmount,
        status: data.recentOrder.status
          ? data.recentOrder.status
              .toLowerCase()
              .replace(/\s+/g, "-")
          : "unknown"
      };
    }

      res.render("account/index", {
        activeMenu: "dashboard",
        title: "SOLESYNTAX",
        user: data.user,
        totalOrders: data.totalOrders,
        pendingOrders: data.pendingOrders,
        savedAddresses: data.savedAddresses,
        wishlistItems: data.wishlistItems,
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

    const user = await accountService.updateProfile(userId, { name, phone });

    if (!user) {
      return res.redirect("/users/login");
    }
    
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

    await accountService.addAddress(userId, addressData);

    res.redirect("/account/addresses");
    
    
  } catch (err) {
    console.error("Add Address Error:", err);

    if (err.message === 'Maximum 5 addresses allowed') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).render("error", {
      message: "Something went wrong."
    });
  }
}

const getAddresses = async (req, res) => {
  
  try {
    
    const userId = req.user.userId || req.user._id;

    const addresses = await accountService.getAddresses(userId);

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

    const address = await accountService.getAddressById(userId, id);


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
    
    console.error("Get Address By ID Error:", err);

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

    const updatedAddress = await accountService.updateAddress(userId, id, updateData);

    if (!updatedAddress) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
      });
    }

    res.redirect("/account/addresses");

  } catch (err) {
    console.error("Update Address Error:", err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

const setDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;
    const { id } = req.params;

    const address = await accountService.setDefaultAddress(userId, id);


    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
      });
    }

    res.redirect("/account/addresses");

  } catch (err) {
    console.error("Set Default Address Error:", err);

    res.status(500).render("error", {
      message: "Something went wrong."
    })
  }
};

const getDefaultAddress = async (req, res) => {

  try {
    
    const userId = req.user.userId || req.user._id;

    const address = await accountService.getDefaultAddress(userId);
    

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "No default address found."
      });
    }

    res.status(200).json({
      success: true,
      address
    });

  } catch (err) {
    console.error("Get Default Address Error:", err);

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

    const address = await accountService.deleteAddress(userId, id);

    if (!address) {
      return res.status(404).render("error", {
        layout: false,
        status: 404,
        title: "Address Not Found",
        message: "The address you're looking for doesn't exist."
      });
    }

    res.redirect("/account/addresses");

  } catch (err) {
     console.error("Delete Address Error:", err);

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