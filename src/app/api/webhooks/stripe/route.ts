import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Update transaction status
  const { error } = await supabase
    .from('transactions')
    .update({
      payment_status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating transaction:', error);
  }

  // Update listing status to sold
  const { data: transaction } = await supabase
    .from('transactions')
    .select('listing_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (transaction?.listing_id) {
    await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', transaction.listing_id);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Update transaction status
  const { error } = await supabase
    .from('transactions')
    .update({
      payment_status: 'failed',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating transaction:', error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  // Update user's payment verification status
  const { error } = await supabase
    .from('users')
    .update({
      payment_verified: account.charges_enabled,
      payout_enabled: account.payouts_enabled,
    })
    .eq('stripe_account_id', account.id);

  if (error) {
    console.error('Error updating user account:', error);
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  // Create payout record
  const { error } = await supabase
    .from('payouts')
    .insert({
      stripe_transfer_id: transfer.id,
      amount: transfer.amount / 100, // Convert from cents
      currency: transfer.currency,
      status: 'pending', // Default status for new transfers
      description: transfer.description || 'Marketplace payout',
    });

  if (error) {
    console.error('Error creating payout record:', error);
  }
} 