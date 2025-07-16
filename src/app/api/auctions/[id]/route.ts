import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Get a single auction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: auction, error } = await supabase
      .from('auctions')
      .select(
        `
        *,
        listings!auctions_listing_id_fkey (
          id,
          seller_id,
          game_id,
          listing_type,
          price,
          currency,
          condition,
          location_country,
          location_city,
          shipping_options,
          photos,
          description,
          status,
          verified_photos,
          created_at,
          users!listings_seller_id_fkey (
            username,
            location_city
          ),
          games!listings_game_id_fkey (
            title
          )
        )
      `
      )
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    return NextResponse.json({ auction });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an auction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if auction exists and user owns it
    const { data: existingAuction, error: fetchError } = await supabase
      .from('auctions')
      .select(
        `
        status,
        bid_count,
        listing_id
      `
      )
      .eq('id', params.id)
      .single();

    if (fetchError || !existingAuction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Check if user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', existingAuction.listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if auction has bids (can't edit if it has bids)
    if (existingAuction.bid_count > 0) {
      return NextResponse.json(
        {
          error: 'Cannot edit auction with active bids',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      starting_price,
      reserve_price,
      bid_increment,
      end_time,
      buy_now_price,
    } = body;

    // Update auction
    const { data: updatedAuction, error: updateError } = await supabase
      .from('auctions')
      .update({
        starting_price,
        current_price: starting_price, // Reset current price to starting price
        reserve_price,
        bid_increment,
        end_time,
        buy_now_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update auction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ auction: updatedAuction });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an auction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if auction exists and user owns it
    const { data: existingAuction, error: fetchError } = await supabase
      .from('auctions')
      .select(
        `
        status,
        bid_count,
        listing_id
      `
      )
      .eq('id', params.id)
      .single();

    if (fetchError || !existingAuction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Check if user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', existingAuction.listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if auction has bids
    if (existingAuction.bid_count > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete auction with active bids',
        },
        { status: 400 }
      );
    }

    // Delete the auction (this will also delete the associated listing due to cascade)
    const { error: deleteError } = await supabase
      .from('auctions')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete auction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
