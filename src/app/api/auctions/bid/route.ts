import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
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
    const { auctionId, amount } = body;

    if (!auctionId || !amount) {
      return NextResponse.json(
        { error: 'Auction ID and amount are required' },
        { status: 400 }
      );
    }

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bid amount' },
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

    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Check if auction is still active
    if (auction.status !== 'active') {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
    }

    // Check if auction has ended
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (endTime <= now) {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
    }

    // Get current highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    const currentHighestBid = highestBid?.amount || auction.starting_price;

    // Validate bid amount
    if (bidAmount <= currentHighestBid) {
      return NextResponse.json(
        { error: 'Bid must be higher than current price' },
        { status: 400 }
      );
    }

    // Check minimum bid increment
    const minimumBid = currentHighestBid + auction.bid_increment;
    if (bidAmount < minimumBid) {
      return NextResponse.json(
        { error: `Bid must be at least €${minimumBid.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Check if user is the seller
    const { data: listing } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', auction.listing_id)
      .single();

    if (listing?.seller_id === userProfile.id) {
      return NextResponse.json(
        { error: 'You cannot bid on your own auction' },
        { status: 400 }
      );
    }

    // Place the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        bidder_id: userProfile.id,
        amount: bidAmount,
        is_proxy: false,
      })
      .select('*')
      .single();

    if (bidError) {
      return NextResponse.json(
        { error: 'Failed to place bid' },
        { status: 500 }
      );
    }

    // Update auction current price
    const { error: updateError } = await supabase
      .from('auctions')
      .update({ current_price: bidAmount })
      .eq('id', auctionId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update auction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bid,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
