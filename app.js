const express = require('express');
const cookiesParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const passport = require('./config/passport');

const path = require("path");

const connectDB = require('./config/db');

connectDB();

const app = express();
require('./services/emailService');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());
app.use(passport.initialize());

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  '/vendor/chart.js',
  express.static('node_modules/chart.js/dist')
);

// express-ejs-layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/account-layout'); //default layout


// Routes
const authRouter = require('./routes/User/authRouter');
const profileRouter = require('./routes/User/profileRouter');
const adminProfile = require('./routes/admin/adminProfileRrouter');
const adminProductRouter = require('./routes/admin/adminProductRouter');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/User/cartRouter');
const orderRouter = require('./routes/User/orderRouter');
const adminOrderRouter = require('./routes/admin/adminOrderRouter');
const wishlist = require('./routes/User/wishlistRouter');
const customerRouter = require('./routes/admin/customerRouter');
const adminCouponRouter = require('./routes/admin/couponRouter');
const reviewRouter = require('./routes/admin/reviewRouter');
const userCouponRouter = require('./routes/User/couponRouter');
const checkoutRouter = require('./routes/checkoutRouter');
const reportRouter = require('./routes/admin/reportRouter');
const attachUser = require('./middlewares/attachUser');
const { title } = require('process');


app.use(attachUser);

// Public
app.use('/', productRouter);

// User
app.use('/users', authRouter);
app.use('/', profileRouter);
app.use('/cart', cartRouter);
app.use('/order',orderRouter);
app.use('/wishlist', wishlist);
app.use('/coupons', userCouponRouter);
app.use('/checkout', checkoutRouter);

// Admin
app.use('/admin', adminProfile);
app.use('/admin/products', adminProductRouter);
app.use('/admin/orders', adminOrderRouter);
app.use('/admin', customerRouter);
app.use('/admin/coupons', adminCouponRouter);
app.use('/admin/reviews', reviewRouter);
app.use('/admin/reports', reportRouter);

// 404 handler 
app.use((req, res) => {
  res.status(404).render('error', {
    layout: false,
    status: 404,
    title: 'Page Not Found',
    message: "Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track."
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).render('error', {
    layout: false,
    status: status,
    title: status === 500 ? 'Server Error' : 'Error',
    message: status === 500
    ? 'Something went wrong on our end. Please try again later.'
    : err.message || 'An unexpected error occurred.'
  })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});