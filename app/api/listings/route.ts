import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"
import { bggService } from "@/lib/bgg"
import { imageUploadService } from "@/lib/image-upload"

// GET - Fetch listings with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""
  const condition = searchParams.get("condition") || ""
  const country = searchParams.get("country") || ""
  const city = searchParams.get("city") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  try {
    const supabase = createServerSupabaseClient()
    
              let query = supabase
            .from('listings')
            .select('*')
            .eq('status', 'active')
            .eq('is_active', true)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (condition) {
      query = query.eq('condition', condition)
    }

    if (country) {
      query = query.eq('country', country)
    }

    if (city) {
      query = query.eq('city', city)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    // Get total count for pagination
    const { count } = await query

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
            query = query.order('created_at', { ascending: false })

    const { data: listings, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const condition = formData.get('condition') as string
    const conditionNotes = formData.get('conditionNotes') as string
    const price = parseFloat(formData.get('price') as string)
    const city = formData.get('city') as string
    const country = formData.get('country') as string
    const tradingOptions = JSON.parse(formData.get('tradingOptions') as string || '[]')
    const bggId = formData.get('bggId') as string
    const bggData = formData.get('bggData') ? JSON.parse(formData.get('bggData') as string) : null
    const images = formData.getAll('images') as File[]

    // Validate required fields
    if (!title || !description || !condition || !price || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Create listing first to get ID for image uploads
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        condition,
        condition_notes: conditionNotes,
        price,
        city,
        country,
        trading_options: tradingOptions,
        bgg_id: bggId,
        bgg_data: bggData,
        user_id: user.id,
        images: []
      })
      .select()
      .single()

    if (listingError) {
      throw listingError
    }

    // Upload images if provided
    let imageUrls: string[] = []
    if (images.length > 0) {
      try {
        // Initialize bucket
        await imageUploadService.initializeBucket()
        
        // Upload images
        const uploadedImages = await imageUploadService.uploadImages(images, listing.id)
        imageUrls = uploadedImages.map(img => img.url)
        
        // Update listing with image URLs
        await supabase
          .from('listings')
          .update({ images: imageUrls })
          .eq('id', listing.id)
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError)
        // Continue without images rather than failing the entire listing
      }
    }

    // Get the complete listing with user and game data
    const { data: completeListing, error: fetchError } = await supabase
      .from('listings')
      .select(`
        *,
        user:users(id, username, full_name, city, country, rating),
        game:games(id, name, year_published, thumbnail, bgg_rating)
      `)
      .eq('id', listing.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      success: true,
      listing: completeListing
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
} 