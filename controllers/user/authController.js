const User = require('../../models/userSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists, please login instead'
      });
    }

    // Password hashing
    bcrypt.genSalt(10, async (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.send(err.message);
        } else {
          const user = await User.create({
            name,
            email,
            password: hash
          });
        }
      })
    })
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({email: email});
  if (!user) {
    return res.status(401).json({
      message: 'Email is INVALID'
    });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      const token = jwt.sign({ userId: user._id, email: user.email },process.env.JWT_SECRET, { expiresIn: "7d"});
      res.cookie("token",token);
      res.status(201).json({ 
        message: 'user logined successfuly'});
    } else {
      res.status(401).json({
        message: 'Password is INVALID'});
    }
  })
}

module.exports = {
  registerUser,
  loginUser
};