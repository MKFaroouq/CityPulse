const mongoose = require('mongoose');

// user schema for citizen, engineer, and admin
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'citizen', 'engineer'],
    default: 'citizen',
  },
    // Engineers are assigned to a city sector (e.g. "cairo", "giza", "alexandria") for issue assignment
    // Citizens may optionally store their sector for filtering
    sector: {
      type: String,
      trim: true,
      default: null,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;