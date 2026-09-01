const express = require('express');
const router = express.Router();
const {
  createDelivery, getUserDeliveries, getLibrarianDeliveries, updateDeliveryStatus, getDeliveryById
} = require('../controllers/delivery.controller');
const { verifyJWT, verifyRole } = require('../middleware/auth');

router.post('/', verifyJWT, verifyRole('user', 'admin'), createDelivery);
router.get('/user/:email', verifyJWT, getUserDeliveries);
router.get('/librarian/:email', verifyJWT, verifyRole('librarian', 'admin'), getLibrarianDeliveries);
router.get('/:id', verifyJWT, getDeliveryById);
router.patch('/:id/status', verifyJWT, verifyRole('librarian', 'admin'), updateDeliveryStatus);

module.exports = router;
