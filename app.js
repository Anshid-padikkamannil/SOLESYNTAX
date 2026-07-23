const express = require('express');
const cookiesParser = require('cookie-parser');
const dotenv = require('dotenv').config();

const connectDB = require('./config/db');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());

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


app.use('/api/users', authRouter);
app.use('/api/users', profileRouter);
app.use('/api/admin', require('./routes/admin/admin-test'));
app.use('/api/admin/products', adminProductRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/admin/orders', adminOrderRouter);
app.use('/api/wishlist', wishlist);
app.use('/api/admin', customerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});