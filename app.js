const express = require('express');
const cookiesParser = require('cookie-parser');
const dotenv = require('dotenv').config();

const path = require("path");

const connectDB = require('./config/db');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRouter = require('./routes/User/authRouter');
const profileRouter = require('./routes/User/profileRouter');
const adminProductRouter = require('./routes/admin/adminProductRouter');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/User/cartRouter');
const orderRouter = require('./routes/User/orderRouter');
const adminOrderRouter = require('./routes/admin/adminOrderRouter');
const wishlist = require('./routes/User/wishlistRouter');
const customerRouter = require('./routes/admin/customerRouter');
const adminCouponRouter = require('./routes/admin/couponRouter');
const userCouponRouter = require('./routes/User/couponRouter');
const paymentRouter = require('./routes/paymentRouter');
const attachUser = require('./middlewares/attachUser');


app.use(attachUser);

// Public
app.use('/', productRouter);

// User
app.use('/users', authRouter);
app.use('/users', profileRouter);
app.use('/cart', cartRouter);
app.use('/order',orderRouter);
app.use('/wishlist', wishlist);
app.use('/coupons', userCouponRouter);
app.use('/payment', paymentRouter);

// Admin
app.use('/admin', require('./routes/admin/admin-test'));
app.use('/admin/products', adminProductRouter);
app.use('/admin/orders', adminOrderRouter);
app.use('/admin', customerRouter);
app.use('/admin/coupons', adminCouponRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});