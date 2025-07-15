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
      shippingOptions
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

    // Validate price for non-trade listings
    if (listingType !== 'trade' && (!price || parseFloat(price) <= 0)) {
      return NextResponse.json(
        { error: 'Price is required for non-trade listings' },
        { status: 400 }
      )
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
      price: listingType === 'trade' ? null : parseFloat(price),
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