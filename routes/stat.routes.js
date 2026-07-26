const express = require('express');
const router = express.Router();
const { getAdminStats, getLibrarianStats, getUserStats } = require('../controllers/stat.controller');
const { verifyJWT, verifyRole } = require('../middleware/auth');

router.get('/admin-stats', verifyJWT, verifyRole('admin'), getAdminStats);
router.get('/librarian-stats/:email', verifyJWT, verifyRole('librarian', 'admin'), getLibrarianStats);
router.get('/user-stats/:email', verifyJWT, getUserStats);

module.exports = router;
