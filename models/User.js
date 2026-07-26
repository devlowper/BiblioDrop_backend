const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    // Not required for Google OAuth users, but required for regular email/password
  },
  photoURL: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'librarian', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
