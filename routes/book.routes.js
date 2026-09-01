const express = require('express');
const router = express.Router();
const {
  createBook, getBooks, getBookById, updateBook, publishBook, approveBook, deleteBook, getLibrarianBooks
} = require('../controllers/book.controller');
const { verifyJWT, verifyRole } = require('../middleware/auth');

router.post('/', verifyJWT, verifyRole('librarian', 'admin'), createBook);
router.get('/', getBooks); // Public
router.get('/librarian/:email', verifyJWT, verifyRole('librarian', 'admin'), getLibrarianBooks);
router.get('/:id', getBookById); // Public
router.patch('/:id', verifyJWT, verifyRole('librarian', 'admin'), updateBook);
router.patch('/:id/publish', verifyJWT, verifyRole('librarian'), publishBook);
router.patch('/:id/approve', verifyJWT, verifyRole('admin'), approveBook);
router.delete('/:id', verifyJWT, verifyRole('librarian', 'admin'), deleteBook);

module.exports = router;
