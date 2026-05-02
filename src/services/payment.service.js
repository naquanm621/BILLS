const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

/**
 * Secure Banking Token Service
 * Creates virtual card tokens that mask real banking data
 * If breached, attackers only see tokens, not real card/bank info
 */
class BankingTokenService {
  constructor() {
    // In production, use a secure database with encryption
    this.tokenVault = new Map(); // token -> encrypted banking data
  }

  /**
   * Create a virtual card token for a user
   * @param {Object} bankingData - { cardNumber, expiryMonth, expiryYear, cvc, cardholderName }
   * @returns {String} virtualCardToken - Secure token (e.g., "vc_xxxx_4242")
   */
  createVirtualCardToken(bankingData) {
    // Generate unique token
    const tokenId = 'vc_' + crypto.randomBytes(16).toString('hex').substring(0, 12);
    const last4 = bankingData.cardNumber.slice(-4);
    
    // Encrypt banking data (in production, use proper encryption)
    const encrypted = this.encryptData(bankingData);
    
    // Store in vault
    this.tokenVault.set(tokenId, {
      encryptedData: encrypted,
      last4: last4,
      cardholderName: bankingData.cardholderName,
      expiryMonth: bankingData.expiryMonth,
      expiryYear: bankingData.expiryYear,
      createdAt: new Date(),
      usageCount: 0,
      maxUsage: 100 // Token expires after 100 uses for security
    });

    // Return masked token reference
    return {
      token: tokenId,
      maskedCard: `•••• •••• •••• ${last4}`,
      last4: last4,
      cardholderName: bankingData.cardholderName,
      expiry: `${bankingData.expiryMonth}/${bankingData.expiryYear}`
    };
  }

  /**
   * Get real card data from token (internal use only)
   * Never expose this to frontend or logs
   */
  getCardDataFromToken(tokenId) {
    const vaultEntry = this.tokenVault.get(tokenId);
    if (!vaultEntry) {
      throw new Error('Invalid or expired card token');
    }
    
    if (vaultEntry.usageCount >= vaultEntry.maxUsage) {
      this.tokenVault.delete(tokenId);
      throw new Error('Card token has exceeded maximum usage limit');
    }

    vaultEntry.usageCount++;
    return this.decryptData(vaultEntry.encryptedData);
  }

  /**
   * Create a one-time payment token for a specific transaction
   * This token can only be used once and expires after 5 minutes
   */
  createPaymentToken(virtualCardToken, amount, merchantId) {
    const paymentToken = 'pt_' + crypto.randomBytes(16).toString('hex').substring(0, 16);
    
    this.tokenVault.set(paymentToken, {
      type: 'payment',
      virtualCardToken: virtualCardToken,
      amount: amount,
      merchantId: merchantId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      used: false
    });

    return paymentToken;
  }

  /**
   * Validate and redeem payment token
   */
  redeemPaymentToken(paymentToken) {
    const entry = this.tokenVault.get(paymentToken);
    
    if (!entry || entry.type !== 'payment') {
      throw new Error('Invalid payment token');
    }
    
    if (entry.used) {
      throw new Error('Payment token already used');
    }
    
    if (new Date() > entry.expiresAt) {
      this.tokenVault.delete(paymentToken);
      throw new Error('Payment token expired');
    }

    entry.used = true;
    
    // Get real card data
    const cardData = this.getCardDataFromToken(entry.virtualCardToken);
    
    return {
      cardData: cardData,
      amount: entry.amount,
      merchantId: entry.merchantId
    };
  }

  /**
   * Encrypt sensitive data (simplified - use proper encryption in production)
   */
  encryptData(data) {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const text = JSON.stringify(data);
    // Simple XOR encryption for demo - use AES-256-GCM in production
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(encrypted).toString('base64');
  }

  decryptData(encrypted) {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const text = Buffer.from(encrypted, 'base64').toString();
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
      decrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  }

  /**
   * Get masked card info for display (safe for frontend)
   */
  getMaskedCardInfo(tokenId) {
    const entry = this.tokenVault.get(tokenId);
    if (!entry) return null;
    
    return {
      maskedCard: `•••• •••• •••• ${entry.last4}`,
      last4: entry.last4,
      cardholderName: entry.cardholderName,
      expiry: `${entry.expiryMonth}/${entry.expiryYear}`,
      usageCount: entry.usageCount,
      maxUsage: entry.maxUsage
    };
  }

  /**
   * Revoke a token
   */
  revokeToken(tokenId) {
    this.tokenVault.delete(tokenId);
    return { success: true };
  }
}

// Create singleton instance
const bankingTokenService = new BankingTokenService();

/**
 * Process payment with Stripe using tokenized card
 */
async function processPaymentWithToken(paymentToken, vendorInfo) {
  try {
    // Redeem payment token to get real card data
    const paymentData = bankingTokenService.redeemPaymentToken(paymentToken);
    const { cardData, amount } = paymentData;

    // Create Stripe PaymentMethod
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardData.cardNumber,
        exp_month: parseInt(cardData.expiryMonth),
        exp_year: parseInt(cardData.expiryYear),
        cvc: cardData.cvc,
      },
      billing_details: {
        name: cardData.cardholderName,
      },
    });

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethod.id,
      confirm: true,
      description: `Payment to ${vendorInfo.name}`,
      metadata: {
        vendor_id: vendorInfo.id,
        vendor_name: vendorInfo.name,
        masked_card: `••••${cardData.cardNumber.slice(-4)}`,
        token_used: 'true',
      },
    });

    // Generate receipt with masked data
    const receipt = {
      id: paymentIntent.id,
      amount: amount,
      currency: 'usd',
      status: paymentIntent.status,
      vendor: vendorInfo.name,
      maskedCard: `•••• ${cardData.cardNumber.slice(-4)}`,
      timestamp: new Date().toISOString(),
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url || null,
      // Never include full card data in receipt
    };

    return {
      success: true,
      paymentIntent: paymentIntent.id,
      status: paymentIntent.status,
      receipt: receipt,
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create Stripe Connect account for vendor (for receiving payments)
 */
async function createVendorConnectAccount(vendorInfo) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: vendorInfo.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: vendorInfo.name,
        url: vendorInfo.website || undefined,
      },
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/vendor/onboarding/success`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error('Vendor account creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Transfer payment to vendor (using Stripe Connect)
 */
async function transferToVendor(paymentIntentId, vendorAccountId, amount) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: vendorAccountId,
      source_transaction: paymentIntentId,
    });

    return {
      success: true,
      transferId: transfer.id,
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  bankingTokenService,
  processPaymentWithToken,
  createVendorConnectAccount,
  transferToVendor,
};
