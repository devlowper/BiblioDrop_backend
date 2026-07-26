const Book = require('../models/Book');

const createBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body, status: 'pending_approval' }; // Always default to pending
    // Enforce librarian logic via auth middleware checks, assuming req.user has email and id
    // We should get librarian info from req.user but req.body might provide it, safer to override
    if (req.user) {
      bookData.librarianEmail = req.user.email;
      bookData.librarianId = req.user.id;
    }
    
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { search, category, minFee, maxFee, availability, page = 1, limit = 6 } = req.query;
    
    let query = { status: 'published' }; // Only public published books
    
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (availability) query.availability = availability;
    
    if (minFee || maxFee) {
      query.deliveryFee = {};
      if (minFee) query.deliveryFee.$gte = Number(minFee);
      if (maxFee) query.deliveryFee.$lte = Number(maxFee);
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const books = await Book.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    const total = await Book.countDocuments(query);
    
    res.json({
      success: true,
      data: books,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    // Check ownership if not admin
    if (req.user.role !== 'admin' && book.librarianEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this book' });
    }
    
    // Prevent changing status via this generic update if needed, but schema validates
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const publishBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    if (book.librarianEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (book.status === 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Cannot publish a book pending approval' });
    }
    
    book.status = 'published';
    await book.save();
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const approveBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    book.status = 'published';
    await book.save();
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    if (req.user.role !== 'admin' && book.librarianEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }
    
    await book.deleteOne();
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
};

const getLibrarianBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ librarianEmail: req.params.email }).sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook, getBooks, getBookById, updateBook, publishBook, approveBook, deleteBook, getLibrarianBooks
};
