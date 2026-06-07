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
const profileRouter = require('./routes/User/profileRoutes');

app.use('/api/users', profileRouter);
app.use('/api/users', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});