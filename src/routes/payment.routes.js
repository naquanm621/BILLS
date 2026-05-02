const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Tokenize card (securely store card, return token)
router.post('/tokenize-card', paymentController.tokenizeCard);

// Get masked card info from token
router.get('/card-info/:token', paymentController.getCardInfo);

// Create payment intent (tap to pay initiation)
router.post('/create-intent', paymentController.createPaymentIntent);

// Confirm and process payment (tap to pay confirmed)
router.post('/confirm', paymentController.confirmPayment);

// Register vendor for receiving payments
router.post('/register-vendor', paymentController.registerVendor);

// Revoke card token
router.delete('/revoke-card/:token', paymentController.revokeCardToken);

// Get receipts
router.get('/receipts', paymentController.getReceipts);

module.exports = router;
