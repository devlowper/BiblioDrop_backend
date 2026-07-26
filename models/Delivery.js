const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  bookTitle: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  librarianEmail: {
    type: String,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'delivered'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
