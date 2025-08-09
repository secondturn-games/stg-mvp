import { NextRequest, NextResponse } from 'next/server'
import { supabase, createServerSupabaseClient } from '@/lib/db'
import type { CreateListingForm } from '@/types'

// GET - Fetch listings with filtering
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/listings called')
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'active'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const user_id = searchParams.get('user_id')
  const sale_type = searchParams.get('sale_type')
  const condition = searchParams.get('condition')
  const min_price = searchParams.get('min_price')
  const max_price = searchParams.get('max_price')
  const city = searchParams.get('city')
  const country = searchParams.get('country')
  
  console.log('🔍 Query params:', { status, limit, offset })
  
  try {
    const supabaseClient = supabase
    
    let query = supabaseClient
      .from('listings')
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          avatar,
          rating,
          review_count,
          city,
          country,
          is_verified
        )
      `)
      .eq('status', status)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (user_id) query = query.eq('user_id', user_id)
    if (sale_type) query = query.eq('sale_type', sale_type)
    if (condition) query = query.eq('condition', condition)
    if (min_price) query = query.gte('price', parseFloat(min_price))
    if (max_price) query = query.lte('price', parseFloat(max_price))
    if (city) query = query.eq('city', city)
    if (country) query = query.eq('country', country)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: listings, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    console.log('✅ Found', listings?.length || 0, 'listings')

    return NextResponse.json({ success: true, listings })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  console.log('🔥 POST function started')
  try {
    console.log('📥 POST request received')

    // Get user ID from request headers (sent from frontend)
    const userIdHeader = request.headers.get('x-user-id')
    if (!userIdHeader) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }
    
    const user = { id: userIdHeader }
    console.log('✅ Using authenticated user:', user.id)

    const formData: CreateListingForm = await request.json()
    console.log('📋 Received form data:', formData)
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'condition', 'price', 'city', 'country']
    for (const field of requiredFields) {
      if (!formData[field as keyof CreateListingForm]) {
        console.log(`❌ Missing field: ${field}`)
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }
    console.log('✅ All required fields present')

    // Convert form data to database format
    const listingData = {
      title: formData.title,
      description: formData.description,
      condition: formData.condition,
      condition_notes: formData.condition_notes || null,
      price: formData.price,
      currency: 'EUR', // Default to EUR
      city: formData.city,
      country: formData.country,
      local_area: formData.local_area || null,
      pickup_radius: formData.pickup_radius || 50,
      trading_options: [], // TODO: Implement trading options
      images: [], // TODO: Handle file uploads
      sale_type: formData.sale_type || 'fixed-price',
      shipping_methods: formData.shipping_methods || [],
      shipping_costs: convertShippingCosts(formData.shipping_costs),
      extras_categories: formData.extras_categories || [],
      extras_notes: formData.extras_notes || null,
      included_items: formData.included_items || [],
      version_name: formData.version_name || null,
      version_id: formData.version_id || null,
      bgg_id: formData.bgg_id || null,
      bgg_data: formData.bgg_data || null,
      user_id: user.id,
      game_id: formData.game_id || null,
      status: 'active',
      is_active: true,
      view_count: 0,
      favorite_count: 0
    }

    console.log('📝 Attempting to insert listing:', listingData)

    // Use the correct supabase client
    const supabaseClient = createServerSupabaseClient()
    
    // First, let's try a simple insert without joins to see if that works
    const { data: listing, error: insertError } = await supabaseClient
      .from('listings')
      .insert([listingData])
      .select('*')
      .single()
      
    console.log('💾 Insert result:', { listing, insertError })

    if (insertError) {
      console.error('❌ Database insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create listing',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('✅ Listing created successfully:', listing.id)

    return NextResponse.json({ 
      success: true,
      listing 
    }, { status: 201 })

  } catch (error) {
    console.error('❌ API error occurred:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to convert shipping costs from strings to numbers
function convertShippingCosts(costs: { [method: string]: string } = {}): { [method: string]: number } {
  const converted: { [method: string]: number } = {}
  
  for (const [method, cost] of Object.entries(costs)) {
    const numericCost = parseFloat(cost)
    if (!isNaN(numericCost) && numericCost >= 0) {
      converted[method] = numericCost
    }
  }
  
  return converted
}