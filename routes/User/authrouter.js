const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getLoginPage, 
  logout, 
  loadRegisterPage,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} = require('../../controllers/authController');

const passport = require('../../config/passport');

const generateTokenAndSetCookie = require('../../utils/jwt');


router.get('/register', loadRegisterPage);
router.get("/login", getLoginPage);
router.get('/logout', logout);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.get('/verify-notice',(req, res) => {
  res.render('users/verify-notice', {layout: false});
});
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.get('/forgot-password', (req, res) => {
  res.render('users/forgot-password', {layout: false});
});
router.post('/reset-password', resetPassword);
router.get('/reset-password', (req, res) => {
  const { token } = req.query;

  res.render('users/reset-password', {
    layout: false,
    token
  });
});

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false}, (err, user, info) => {
    if (err) {
      return res.redirect('/users/login?error=' + encodeURIComponent(err.message));
    }

    if (!user) {
      return res.redirect('/users/login');
    }

    req.user = user;
    next();
  })(req, res, next);
},
  (req,res) => {
    console.log('Google authentication successful');
    console.log(req.user);

    generateTokenAndSetCookie(req.user, res);

    res.redirect('/');  
  }
);

module.exports = router;