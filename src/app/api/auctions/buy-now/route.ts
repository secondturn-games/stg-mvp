import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import { getCurrentUserProfile } from '@/lib/user-service';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { auctionId } = body;

    if (!auctionId) {
      return NextResponse.json(
        { error: 'Auction ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      );
    }

    // Get auction details with listing
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select(
        `
        *,
        listings!auctions_listing_id_fkey (
          seller_id,
          price,
          currency
        )
      `
      )
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Check if auction is still active
    if (auction.status !== 'active') {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
    }

    // Check if buy now price is available
    if (!auction.buy_now_price) {
      return NextResponse.json(
        { error: 'Buy now price not available' },
        { status: 400 }
      );
    }

    // Check if user is the seller
    if (auction.listings.seller_id === userProfile.id) {
      return NextResponse.json(
        { error: 'You cannot buy your own auction' },
        { status: 400 }
      );
    }

    // Check if auction has ended
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (endTime <= now) {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
    }

    // End the auction and mark as sold
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        status: 'ended',
        winner_id: userProfile.id,
        current_price: auction.buy_now_price,
      })
      .eq('id', auctionId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to end auction' },
        { status: 500 }
      );
    }

    // Update listing status
    const { error: listingUpdateError } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', auction.listing_id);

    if (listingUpdateError) {
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id: auction.listing_id,
        buyer_id: userProfile.id,
        seller_id: auction.listings.seller_id,
        amount: auction.buy_now_price,
        platform_fee: auction.buy_now_price * 0.05, // 5% platform fee
        vat_amount: auction.buy_now_price * 0.2, // 20% VAT
        escrow_status: 'pending',
        completed_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Purchase successful!',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
