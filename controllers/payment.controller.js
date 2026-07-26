const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Book = require('../models/Book');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availability !== 'available') {
      return res.status(400).json({ success: false, message: 'Book is not available for delivery' });
    }

    // Amount is fetched authoritatively from the DB
    const amount = book.deliveryFee * 100; // Stripe expects cents

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookId: book._id.toString(),
        userEmail: req.user.email
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent };
