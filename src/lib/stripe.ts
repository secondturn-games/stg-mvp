import Stripe from 'stripe';

// Initialize Stripe server-side client with proper error handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

// Initialize Stripe client-side
export const getStripeClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.warn('Stripe publishable key not found');
    return null;
  }
  
  return require('@stripe/stripe-js').loadStripe(publishableKey);
};

// Payment intent creation
export const createPaymentIntent = async (amount: number, currency: string = 'eur') => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, error: 'Failed to create payment intent' };
  }
};

// Connect account creation
export const createConnectAccount = async (email: string, country: string) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    
    return { success: true, accountId: account.id };
  } catch (error) {
    console.error('Error creating connect account:', error);
    return { success: false, error: 'Failed to create connect account' };
  }
};

// Generate account link for onboarding
export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    
    return { success: true, url: accountLink.url };
  } catch (error) {
    console.error('Error creating account link:', error);
    return { success: false, error: 'Failed to create account link' };
  }
};

// Get account details
export const getAccountDetails = async (accountId: string) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    const account = await stripe.accounts.retrieve(accountId);
    return { success: true, account };
  } catch (error) {
    console.error('Error retrieving account:', error);
    return { success: false, error: 'Failed to retrieve account' };
  }
};

// Create transfer to connected account
export const createTransfer = async (
  accountId: string,
  amount: number,
  currency: string = 'eur',
  description?: string
) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      destination: accountId,
      description: description || 'Marketplace payout',
    });
    
    return { success: true, transfer };
  } catch (error) {
    console.error('Error creating transfer:', error);
    return { success: false, error: 'Failed to create transfer' };
  }
};

// Calculate marketplace fees
export const calculateFees = (amount: number, feePercentage: number = 0.05) => {
  const fee = amount * feePercentage;
  const netAmount = amount - fee;
  
  return {
    grossAmount: amount,
    feeAmount: fee,
    netAmount: netAmount,
    feePercentage: feePercentage,
  };
};

// Payment status types
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]; 