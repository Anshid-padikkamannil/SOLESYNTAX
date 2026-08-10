const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: null,
    trim: true
  },
  password: {
    type: String,
    required: true,
    default: null //google users won't have a password
  },
  authProvider: {
    type: String,
    enum: [ "local", "google" ],
    default: "local"
  },
  googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: { // Account Status
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);