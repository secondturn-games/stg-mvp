import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: bids, error } = await supabase
      .from('bids')
      .select(
        `
        *,
        users!bids_bidder_id_fkey (
          id,
          username
        )
      `
      )
      .eq('auction_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bids,
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

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

    // Validate auction exists and is active
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'active')
      .single();

    if (auctionError || !auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found or not active' },
        { status: 404 }
      );
    }

    // Validate bid amount
    if (amount <= auction.current_price) {
      return NextResponse.json(
        { success: false, error: 'Bid must be higher than current price' },
        { status: 400 }
      );
    }

    // Create bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: params.id,
        bidder_id: profile.id,
        amount,
      })
      .select()
      .single();

    if (bidError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create bid' },
        { status: 500 }
      );
    }

    // Update auction current price and bid count
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        current_price: amount,
        bid_count: auction.bid_count + 1,
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating auction:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: bid,
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bid' },
      { status: 500 }
    );
  }
}
