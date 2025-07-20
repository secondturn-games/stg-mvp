# Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for the Second Turn Games marketplace.

## 🚀 **Step 1: Stripe Account Setup**

### 1.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete your business verification
3. Enable the countries you want to support (Estonia, Latvia, Lithuania)

### 1.2 Get API Keys

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your **Publishable Key** and **Secret Key**
3. For production, use the live keys; for testing, use test keys

### 1.3 Set Up Stripe Connect

1. Go to Stripe Dashboard → Connect → Settings
2. Configure your Connect settings for marketplace payments
3. Note your **Connect Client ID**

## 🔧 **Step 2: Environment Variables**

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ **Step 3: Database Schema**

Run the payment schema updates:

```sql
-- Execute the contents of database/payment-schema.sql
-- This adds payment-related tables and fields
```

## 🔗 **Step 4: Webhook Configuration**

### 4.1 Set Up Webhooks in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
4. Copy the webhook signing secret

### 4.2 Test Webhooks (Development)

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🧪 **Step 5: Testing**

### 5.1 Test Cards

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 5.2 Test Flow

1. Create a test listing with a fixed price
2. Click "Buy Now" on the listing
3. Complete payment with test card
4. Verify transaction appears in database
5. Check webhook events in Stripe Dashboard

## 🔒 **Step 6: Security Considerations**

### 6.1 PCI Compliance

- Stripe handles all card data
- Never store card information in your database
- Use Stripe Elements for secure payment forms

### 6.2 Fraud Prevention

- Implement Stripe Radar for fraud detection
- Set up proper webhook signature verification
- Monitor failed payment attempts

### 6.3 Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all payment communications
- Implement proper access controls

## 💰 **Step 7: Fee Structure**

### 7.1 Platform Fees

- **Platform Fee**: 5% of transaction amount
- **Stripe Fee**: ~2.9% + €0.30 per transaction
- **Total Cost**: ~7.9% + €0.30 per transaction

### 7.2 Payout Schedule

- **Standard**: 2-3 business days
- **Express**: Same day (additional fee)
- **Manual**: On-demand (additional fee)

## 🚨 **Step 8: Error Handling**

### 8.1 Common Issues

- **Webhook failures**: Check signature verification
- **Payment declines**: Implement retry logic
- **Account verification**: Guide users through Stripe onboarding

### 8.2 Monitoring

- Set up alerts for failed payments
- Monitor webhook delivery rates
- Track payment success rates

## 📱 **Step 9: User Experience**

### 9.1 Payment Flow

1. User clicks "Buy Now"
2. Redirected to payment page
3. Enter card details securely
4. Payment processed via Stripe
5. Redirected to success page
6. Transaction recorded in database

### 9.2 Seller Onboarding

1. Seller sets up Stripe Connect account
2. Completes identity verification
3. Configures payout methods
4. Can start receiving payments

## 🔄 **Step 10: Production Deployment**

### 10.1 Environment Setup

1. Update environment variables with live keys
2. Configure production webhook endpoints
3. Test with small amounts first

### 10.2 Monitoring Setup

1. Set up Stripe Dashboard alerts
2. Configure error tracking (Sentry, etc.)
3. Monitor payment success rates

### 10.3 Compliance

1. Ensure GDPR compliance
2. Implement proper data retention policies
3. Set up audit logging

## 📚 **Additional Resources**

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [PCI Compliance](https://stripe.com/docs/security)

## 🆘 **Support**

For payment-related issues:

1. Check Stripe Dashboard for transaction details
2. Review webhook logs in your application
3. Contact Stripe support for payment-specific issues
4. Check our application logs for integration issues

## ✅ **Checklist**

- [ ] Stripe account created and verified
- [ ] API keys configured in environment
- [ ] Database schema updated
- [ ] Webhooks configured and tested
- [ ] Payment flow tested with test cards
- [ ] Error handling implemented
- [ ] Production environment configured
- [ ] Monitoring and alerts set up
- [ ] Compliance requirements met
- [ ] Documentation updated

---

**Note**: This payment integration is designed for the Baltic market (Estonia, Latvia, Lithuania) with EUR currency support. For other regions, additional configuration may be required.
