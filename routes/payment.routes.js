const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/payment.controller');
const { verifyJWT, verifyRole } = require('../middleware/auth');

router.post('/create-payment-intent', verifyJWT, verifyRole('user', 'admin'), createPaymentIntent);

module.exports = router;
