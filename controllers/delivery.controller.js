const Delivery = require('../models/Delivery');
const Book = require('../models/Book');

const createDelivery = async (req, res, next) => {
  try {
    const { bookId, transactionId } = req.body;
    let deliveryFee = 16.00;
    let bookTitle = 'External Book';
    let librarianEmail = 'admin@gmail.com';

    if (!bookId.startsWith('ol-') && !bookId.startsWith('gb-')) {
      const book = await Book.findById(bookId);
      if (!book || book.availability === 'checked_out') {
        return res.status(400).json({ success: false, message: 'Book is not available' });
      }
      bookTitle = book.title;
      librarianEmail = book.librarianEmail;
      deliveryFee = book.deliveryFee;

      book.availability = 'checked_out';
      await book.save();
    }
    
    const delivery = await Delivery.create({
      bookId: bookId,
      bookTitle: bookTitle,
      userEmail: req.user.email,
      librarianEmail: librarianEmail,
      deliveryFee: deliveryFee,
      transactionId: transactionId,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

const getUserDeliveries = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const deliveries = await Delivery.find({ userEmail: email }).sort({ requestDate: -1 });
    res.json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

const getLibrarianDeliveries = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const deliveries = await Delivery.find({ librarianEmail: email }).sort({ requestDate: -1 });
    res.json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    
    if (delivery.librarianEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Status progression: pending -> dispatched -> delivered
    delivery.status = status;
    await delivery.save();
    
    res.json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    // Allow if user is the buyer, the librarian for this book, or an admin
    if (delivery.userEmail !== req.user.email && 
        delivery.librarianEmail !== req.user.email && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this delivery' });
    }
    
    res.json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery, getUserDeliveries, getLibrarianDeliveries, updateDeliveryStatus, getDeliveryById
};
