const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0,
  },
  coverImage: {
    type: String, // URL from imgBB
  },
  status: {
    type: String,
    enum: ['pending_approval', 'published', 'unpublished'],
    default: 'pending_approval',
  },
  librarianEmail: {
    type: String,
    required: true,
  },
  librarianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    type: String,
    enum: ['available', 'checked_out'],
    default: 'available',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
