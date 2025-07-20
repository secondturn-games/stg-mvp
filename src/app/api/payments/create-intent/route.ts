import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createPaymentIntent, calculateFees } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listingId, amount, currency = 'eur' } = await request.json();

    // Validate required fields
    if (!listingId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Listing ID and amount are required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get listing details
    const { data: listing } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found or not active' },
        { status: 404 }
      );
    }

    // Prevent buying own listing
    if (listing.seller_id === profile.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot buy your own listing' },
        { status: 400 }
      );
    }

    // Calculate fees
    const fees = calculateFees(amount, 0.05); // 5% platform fee

    // Create payment intent
    const paymentResult = await createPaymentIntent(
      fees.grossAmount,
      currency
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 500 }
      );
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: profile.id,
        seller_id: listing.seller_id,
        amount: fees.grossAmount,
        platform_fee: fees.feeAmount,
        stripe_payment_intent_id: paymentResult.clientSecret?.split('_secret_')[0],
        payment_status: 'pending',
      })
      .select()
      .single();

    if (transactionError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentResult.clientSecret,
      transactionId: transaction.id,
      fees: {
        grossAmount: fees.grossAmount,
        feeAmount: fees.feeAmount,
        netAmount: fees.netAmount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 