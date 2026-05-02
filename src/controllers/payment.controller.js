const {
  bankingTokenService,
  processPaymentWithToken,
  createVendorConnectAccount,
  transferToVendor,
} = require('../services/payment.service');

/**
 * Create a virtual card token for secure storage
 * POST /payment/tokenize-card
 */
async function tokenizeCard(req, res) {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvc, cardholderName } = req.body;

    // Validate required fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !cardholderName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required card information',
      });
    }

    // Create virtual card token
    const tokenData = bankingTokenService.createVirtualCardToken({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      cardholderName,
    });

    res.json({
      success: true,
      message: 'Card tokenized successfully',
      token: tokenData.token,
      maskedCard: tokenData.maskedCard,
      last4: tokenData.last4,
      expiry: tokenData.expiry,
      cardholderName: tokenData.cardholderName,
      // Note: Never return full card data
    });
  } catch (error) {
    console.error('Tokenization error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get masked card info from token
 * GET /payment/card-info/:token
 */
async function getCardInfo(req, res) {
  try {
    const { token } = req.params;
    
    const cardInfo = bankingTokenService.getMaskedCardInfo(token);
    
    if (!cardInfo) {
      return res.status(404).json({
        success: false,
        error: 'Card token not found or expired',
      });
    }

    res.json({
      success: true,
      card: cardInfo,
    });
  } catch (error) {
    console.error('Get card info error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Create payment intent (tap to pay)
 * POST /payment/create-intent
 */
async function createPaymentIntent(req, res) {
  try {
    const { virtualCardToken, amount, vendorId, vendorName } = req.body;

    if (!virtualCardToken || !amount || !vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information',
      });
    }

    // Create one-time payment token
    const paymentToken = bankingTokenService.createPaymentToken(
      virtualCardToken,
      amount,
      vendorId
    );

    res.json({
      success: true,
      message: 'Payment intent created',
      paymentToken: paymentToken,
      amount: amount,
      vendor: vendorName || 'Vendor',
      expiresIn: '5 minutes',
      // User must confirm this token to complete payment
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Confirm and process payment (tap to pay confirmed)
 * POST /payment/confirm
 */
async function confirmPayment(req, res) {
  try {
    const { paymentToken, vendorInfo } = req.body;

    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        error: 'Payment token required',
      });
    }

    // Process payment with token
    const result = await processPaymentWithToken(paymentToken, {
      id: vendorInfo?.id || 'unknown',
      name: vendorInfo?.name || 'Vendor',
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentIntentId: result.paymentIntent,
      status: result.status,
      receipt: result.receipt,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Register vendor for receiving payments
 * POST /payment/register-vendor
 */
async function registerVendor(req, res) {
  try {
    const { name, email, website } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Vendor name and email required',
      });
    }

    const result = await createVendorConnectAccount({
      name,
      email,
      website,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Vendor registration initiated',
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
    });
  } catch (error) {
    console.error('Register vendor error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Revoke card token
 * DELETE /payment/revoke-card/:token
 */
async function revokeCardToken(req, res) {
  try {
    const { token } = req.params;
    
    const result = bankingTokenService.revokeToken(token);
    
    res.json({
      success: true,
      message: 'Card token revoked successfully',
    });
  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get payment receipts for user
 * GET /payment/receipts
 */
async function getReceipts(req, res) {
  try {
    // In production, fetch from database
    // For now, return mock receipts with masked data
    const mockReceipts = [
      {
        id: 'pi_mock_123',
        amount: 150.00,
        vendor: 'Acme Corp',
        maskedCard: '•••• 4242',
        timestamp: new Date().toISOString(),
        status: 'succeeded',
      },
    ];

    res.json({
      success: true,
      receipts: mockReceipts,
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  tokenizeCard,
  getCardInfo,
  createPaymentIntent,
  confirmPayment,
  registerVendor,
  revokeCardToken,
  getReceipts,
};
