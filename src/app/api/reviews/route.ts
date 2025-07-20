import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createReview } from '@/lib/reputation-service';
import { supabase } from '@/lib/supabase';
import type { ReviewData } from '@/lib/reputation-service';

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

    const body = await request.json();
    const {
      transactionId,
      reviewedUserId,
      rating,
      comment,
      reviewType,
      communicationRating,
      shippingRating,
      itemConditionRating,
    } = body;

    // Validate required fields
    if (!transactionId || !reviewedUserId || !rating || !reviewType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate review type
    if (!['buyer', 'seller'].includes(reviewType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review type' },
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

    // Verify transaction exists and user is involved
    const { data: transaction } = await supabase
      .from('transactions')
      .select('buyer_id, seller_id')
      .eq('id', transactionId)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user is part of this transaction
    if (transaction.buyer_id !== profile.id && transaction.seller_id !== profile.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to review this transaction' },
        { status: 403 }
      );
    }

    // Verify reviewed user is the other party in the transaction
    const otherPartyId = transaction.buyer_id === profile.id 
      ? transaction.seller_id 
      : transaction.buyer_id;

    if (otherPartyId !== reviewedUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid reviewed user' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('transaction_id', transactionId)
      .eq('reviewer_id', profile.id)
      .eq('review_type', reviewType)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review already exists for this transaction' },
        { status: 409 }
      );
    }

    // Create review data
    const reviewData: ReviewData = {
      transaction_id: transactionId,
      reviewer_id: profile.id,
      reviewed_id: reviewedUserId,
      rating,
      comment: comment || undefined,
      review_type: reviewType,
      communication_rating: communicationRating || undefined,
      shipping_rating: shippingRating || undefined,
      item_condition_rating: itemConditionRating || undefined,
    };

    // Create the review
    await createReview(reviewData);

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 