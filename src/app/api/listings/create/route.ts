import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/user-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      gameTitle,
      listingType,
      price,
      condition,
      locationCity,
      description,
      images,
      shippingOptions,
      // Auction-specific fields
      startingPrice,
      endTime,
      reservePrice,
      buyNowPrice,
      bidIncrement
    } = body

    // Validate required fields
    if (!gameTitle || !listingType || !condition || !locationCity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate listing type
    const validListingTypes = ['fixed', 'auction', 'trade']
    if (!validListingTypes.includes(listingType)) {
      return NextResponse.json(
        { error: 'Invalid listing type' },
        { status: 400 }
      )
    }

    // Validate condition
    const validConditions = ['new', 'like_new', 'very_good', 'good', 'acceptable']
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { error: 'Invalid condition' },
        { status: 400 }
      )
    }

    // Validate price for fixed listings
    if (listingType === 'fixed' && (!price || parseFloat(price) <= 0)) {
      return NextResponse.json(
        { error: 'Price is required for fixed listings' },
        { status: 400 }
      )
    }

    // Validate auction fields
    if (listingType === 'auction') {
      if (!startingPrice || parseFloat(startingPrice) <= 0) {
        return NextResponse.json(
          { error: 'Starting price is required for auctions' },
          { status: 400 }
        )
      }
      
      if (!endTime) {
        return NextResponse.json(
          { error: 'End time is required for auctions' },
          { status: 400 }
        )
      }

      const endTimeDate = new Date(endTime)
      const now = new Date()
      if (endTimeDate <= now) {
        return NextResponse.json(
          { error: 'End time must be in the future' },
          { status: 400 }
        )
      }

      if (reservePrice && parseFloat(reservePrice) <= 0) {
        return NextResponse.json(
          { error: 'Reserve price must be positive' },
          { status: 400 }
        )
      }

      if (buyNowPrice && parseFloat(buyNowPrice) <= 0) {
        return NextResponse.json(
          { error: 'Buy now price must be positive' },
          { status: 400 }
        )
      }

      if (!bidIncrement || parseFloat(bidIncrement) <= 0) {
        return NextResponse.json(
          { error: 'Bid increment is required for auctions' },
          { status: 400 }
        )
      }
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      )
    }

    // Create listing
    const listingData = {
      seller_id: userProfile.id,
      game_id: null, // We'll handle game database integration later
      listing_type: listingType,
      price: listingType === 'trade' ? null : (listingType === 'fixed' ? parseFloat(price) : parseFloat(startingPrice)),
      currency: 'EUR',
      condition,
      location_country: userProfile.country,
      location_city: locationCity,
      shipping_options: shippingOptions,
      photos: images || [], // Store uploaded image URLs
      description: { en: `${gameTitle} - ${description}`, et: `${gameTitle} - ${description}`, lv: `${gameTitle} - ${description}`, lt: `${gameTitle} - ${description}` },
      status: 'active',
      verified_photos: false
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert(listingData)
      .select('*')
      .single()

    if (listingError) {
      console.error('Error creating listing:', listingError)
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }

    // If it's an auction, create the auction record
    if (listingType === 'auction') {
      const auctionData = {
        listing_id: listing.id,
        starting_price: parseFloat(startingPrice),
        current_price: parseFloat(startingPrice),
        reserve_price: reservePrice ? parseFloat(reservePrice) : null,
        bid_increment: parseFloat(bidIncrement),
        end_time: new Date(endTime).toISOString(),
        extension_time: 300, // 5 minutes
        buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
        status: 'active'
      }

      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .insert(auctionData)
        .select('*')
        .single()

      if (auctionError) {
        console.error('Error creating auction:', auctionError)
        // Clean up the listing if auction creation fails
        await supabase.from('listings').delete().eq('id', listing.id)
        return NextResponse.json(
          { error: 'Failed to create auction' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        listing,
        auction
      })
    }

    return NextResponse.json({
      success: true,
      listing
    })

  } catch (error) {
    console.error('Error in create listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
} 