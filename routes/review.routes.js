const express = require('express');
const router = express.Router();
const {
  createReview, getBookReviews, getUserReviews, updateReview, deleteReview
} = require('../controllers/review.controller');
const { verifyJWT } = require('../middleware/auth');

router.post('/', verifyJWT, createReview);
router.get('/book/:bookId', getBookReviews); // Public
router.get('/user/:email', verifyJWT, getUserReviews);
router.patch('/:id', verifyJWT, updateReview);
router.delete('/:id', verifyJWT, deleteReview);

module.exports = router;
