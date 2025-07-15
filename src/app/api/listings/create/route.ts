import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      gameTitle,
      listingType,
      price,
      currency,
      condition,
      locationCity,
      description,
      images,
      shippingOptions,
      // Auction-specific fields
      startingPrice,
      auctionDays,
      endTime,
      reservePrice,
      buyNowPrice,
      bidIncrement,
    } = body;

    // Validate required fields
    if (
      !gameTitle ||
      !listingType ||
      !condition ||
      !locationCity ||
      !description
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!userProfile) {
      // Create user profile if it doesn't exist
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          username: `user_${userId.slice(-8)}`, // Generate a default username
          email: null, // Will be filled by Clerk webhook
          country: 'EE', // Default to Estonia
          preferred_language: 'en',
        })
        .single();

      if (createUserError) {
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

    // Create or get game
    let gameId: string;
    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .eq('title->en', gameTitle)
      .single();

    if (existingGame) {
      gameId = existingGame.id;
    } else {
      const { data: newGame, error: gameError } = await supabase
        .from('games')
        .insert({
          title: { en: gameTitle },
        })
        .select('id')
        .single();

      if (gameError) {
        return NextResponse.json(
          { error: 'Failed to create game' },
          { status: 500 }
        );
      }

      gameId = newGame.id;
    }

    // Calculate auction end time if it's an auction
    let auctionEndTime: string | null = null;
    if (listingType === 'auction') {
      if (!startingPrice || !auctionDays || !endTime) {
        return NextResponse.json(
          { message: 'Missing auction fields' },
          { status: 400 }
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(endTime)) {
        return NextResponse.json(
          { message: 'Invalid time format. Use HH:MM (24-hour format)' },
          { status: 400 }
        );
      }

      // Calculate end time: current date + auction days + end time
      const now = new Date();
      const [hours, minutes] = endTime.split(':').map(Number);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + parseInt(auctionDays));
      endDate.setHours(hours, minutes, 0, 0);

      auctionEndTime = endDate.toISOString();
    }

    // Create listing
    const listingData = {
      seller_id: userProfile.id,
      game_id: gameId,
      listing_type: listingType,
      price: listingType === 'fixed' ? parseFloat(price) : null,
      currency: currency || 'EUR',
      condition,
      location_country: 'EE', // Default to Estonia
      location_city: locationCity,
      shipping_options: shippingOptions,
      photos: images || [],
      description: { en: description },
      status: 'active',
    };

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert(listingData)
      .select('id')
      .single();

    if (listingError) {
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    // Create auction if it's an auction listing
    if (listingType === 'auction') {
      const auctionData = {
        listing_id: listing.id,
        starting_price: parseFloat(startingPrice),
        current_price: parseFloat(startingPrice),
        reserve_price: reservePrice ? parseFloat(reservePrice) : null,
        bid_increment: parseFloat(bidIncrement),
        end_time: auctionEndTime,
        extension_time: 300, // 5 minutes
        buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
        status: 'active',
        minimum_bid: parseFloat(startingPrice),
      };

      const { error: auctionError } = await supabase
        .from('auctions')
        .insert(auctionData);

      if (auctionError) {
        return NextResponse.json(
          { error: 'Failed to create auction' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      listing: { id: listing.id },
      listingType: listingType,
      message: 'Listing created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
