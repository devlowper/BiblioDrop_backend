const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Book = require('../models/Book');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookId, amount: frontendAmount, isCart } = req.body;
    
    if (!isCart && !bookId) {
      return res.status(400).json({ success: false, message: 'Book ID or isCart flag is required' });
    }

    let amount = frontendAmount ? frontendAmount * 100 : 1600; // default 1600 cents
    
    if (!isCart && bookId && !bookId.startsWith('ol-') && !bookId.startsWith('gb-')) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      if (book.availability !== 'available') {
        return res.status(400).json({ success: false, message: 'Book is not available for delivery' });
      }
      amount = book.deliveryFee * 100; 
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // ensure integer
      currency: 'usd',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookId: isCart ? 'cart_checkout' : String(bookId),
        userEmail: req.user?.email || 'guest@example.com'
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
