const Review = require('../models/Review');
const Delivery = require('../models/Delivery');

const createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userEmail = req.user.email;
    const userName = req.user.name || 'Anonymous User'; // Assuming name is on token or we fetch it. Let's rely on body if we want, or require fetching user. Actually, better get it from body or token. For now, rely on req.body for userName if not in token.
    const reviewerName = req.body.userName || req.user.email;

    // Verify a "delivered" delivery record exists for this user + book
    const delivery = await Delivery.findOne({
      bookId,
      userEmail,
      status: 'delivered'
    });

    if (!delivery) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only review books you have successfully received.' 
      });
    }

    const review = await Review.create({
      bookId,
      userEmail,
      userName: reviewerName,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const reviews = await Review.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.userEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.userEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview, getBookReviews, getUserReviews, updateReview, deleteReview
};
