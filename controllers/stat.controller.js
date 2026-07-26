const User = require('../models/User');
const Book = require('../models/Book');
const Delivery = require('../models/Delivery');

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalDeliveries = await Delivery.countDocuments();
    
    const deliveries = await Delivery.find({ status: 'delivered' });
    const revenue = deliveries.reduce((acc, curr) => acc + curr.deliveryFee, 0);

    const booksByCategory = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalDeliveries,
        revenue,
        booksByCategory: booksByCategory.map(b => ({ category: b._id || 'Uncategorized', count: b.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLibrarianStats = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const totalBooks = await Book.countDocuments({ librarianEmail: email });
    const deliveries = await Delivery.find({ librarianEmail: email, status: 'delivered' });
    const totalEarnings = deliveries.reduce((acc, curr) => acc + curr.deliveryFee, 0);
    const activePendingRequests = await Delivery.countDocuments({ librarianEmail: email, status: 'pending' });

    res.json({
      success: true,
      data: {
        totalBooks,
        totalEarnings,
        activePendingRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const totalBooksRead = await Delivery.countDocuments({ userEmail: email, status: 'delivered' });
    const pendingDeliveries = await Delivery.countDocuments({ userEmail: email, status: { $in: ['pending', 'dispatched'] } });
    
    const allDeliveries = await Delivery.find({ userEmail: email });
    const totalSpent = allDeliveries.reduce((acc, curr) => acc + curr.deliveryFee, 0);

    res.json({
      success: true,
      data: {
        totalBooksRead,
        pendingDeliveries,
        totalSpent
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats, getLibrarianStats, getUserStats
};
