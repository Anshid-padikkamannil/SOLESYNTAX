const generateTokenAndSetCookie = require('../utils/jwt');
const authService = require('../services/authService');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;


    const user = await authService.registerUser(name, email, password);

    // Automatically login after registration - from util
    generateTokenAndSetCookie(user, res);
    
    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {

    return res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    
    const { email, password } = req.body;
  
    const user = await authService.loginUser(email, password);


    generateTokenAndSetCookie(user, res);

    res.status(200).json({ 
      message: 'User logged in successfully'
    });
    

  } catch (err) {
    return res.status(401).json({
      message: err.message
    });
  }
  
}

const loadRegisterPage = (req, res) => {
  res.render("auth/register", { layout: false });
}

const getLoginPage = (req, res) => {

  const redirect = req.query.redirect || "/";

  const error = req.query.error || null;

  res.render("auth/login", {
    redirect,
    error,
    layout: false
  });
}

const logout = (req, res) => {
  
  try {
    
    res.clearCookie("token");
    res.redirect('/')

  } catch (err) {
    
  }
}

const changePassword = async (req, res) => {
  try {
    
    const userId = req.user.userId || req.user._id;

    const {currentPassword, newPassword, confirmPassword} = req.body;

    // required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('All password fields are required.')
      );
    }

    // minmun length
    if (newPassword.length < 8) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password must be at least 8 characters.')
      );
    }

    //confirm password
    if (newPassword !== confirmPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password and confirm password do not match.')
      );
    }

    //prevent same password
    if (currentPassword === newPassword) {
      return res.redirect(
        '/account/change-password?error=' +
        encodeURIComponent('New password must be different from your current password.')
      );
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    return res.redirect(
      '/account/change-password?success=' +
      encodeURIComponent('Password changed successfully.')
    );

  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);

    return res.redirect(
      '/account/change-password?error=' +
      encodeURIComponent(err.message)
    );
  }
}

const getPasswordPage = async (req, res) => {

  const error = req.query.error || null;
  const success = req.query.success || null;

  res.render('account/index', {
    activeMenu: 'change-password',
    title: 'Change Password',
    error,
    success
  });
};

module.exports = {
  registerUser,
  loginUser,
  loadRegisterPage,
  getLoginPage,
  logout,
  changePassword,
  getPasswordPage
};