import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Get a single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        users!listings_seller_id_fkey (
          id,
          username,
          location_city
        ),
        games!listings_game_id_fkey (
          title
        )
      `
      )
      .eq('id', params.id)
      .eq('status', 'active')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a listing
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

    // Check if listing exists and user owns it
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id, listing_type')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existingListing.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      price,
      currency,
      condition,
      location_country,
      location_city,
      shipping_options,
      description,
      photos,
    } = body;

    // Update listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({
        price,
        currency,
        condition,
        location_country,
        location_city,
        shipping_options,
        description,
        photos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a listing
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

    // Check if listing exists and user owns it
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id, listing_type')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existingListing.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If it's an auction, check if it has active bids
    if (existingListing.listing_type === 'auction') {
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('status, bid_count')
        .eq('listing_id', params.id)
        .single();

      if (!auctionError && auction && auction.bid_count > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete auction with active bids',
          },
          { status: 400 }
        );
      }
    }

    // Soft delete the listing by setting status to 'inactive'
    const { error: deleteError } = await supabase
      .from('listings')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete listing' },
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
