import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"
import { imageUploadService, UploadedImage } from "@/lib/image-upload"

// GET - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { id } = await params
    
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:users(id, username, full_name, city, country, rating, review_count),
        game:games(id, name, year_published, thumbnail, bgg_rating, mechanics, categories)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_active', true)
      .single()

    if (error || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('listings')
      .update({ viewCount: listing.viewCount + 1 })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      listing
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { id } = await params
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the listing
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('userId')
      .eq('id', id)
      .single()

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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
    const newImages = formData.getAll('newImages') as File[]
    const removeImages = JSON.parse(formData.get('removeImages') as string || '[]')

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

    // Get current images
    const { data: currentListing } = await supabase
      .from('listings')
      .select('images')
      .eq('id', id)
      .single()

    let updatedImages = currentListing?.images || []

    // Remove specified images
    if (removeImages.length > 0) {
      updatedImages = updatedImages.filter(img => !removeImages.includes(img))
      // Note: We don't delete from storage here to avoid breaking existing references
      // In production, you might want to implement a cleanup job
    }

            // Upload new images
        if (newImages.length > 0) {
          try {
            await imageUploadService.initializeBucket()
            const uploadedImages = await imageUploadService.uploadImages(newImages, id)
            const newImageUrls = uploadedImages.map((img: UploadedImage) => img.url)
            updatedImages = [...updatedImages, ...newImageUrls]
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError)
          }
        }

    // Update listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        description,
        condition,
        condition_notes: conditionNotes,
        price,
        city,
        country,
        trading_options: tradingOptions,
        images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, username, full_name, city, country, rating),
        game:games(id, name, year_published, thumbnail, bgg_rating)
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE - Delete listing (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { id } = await params
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id, images')
      .eq('id', id)
      .single()

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Soft delete the listing
    const { error: deleteError } = await supabase
      .from('listings')
      .update({
        status: 'archived',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
} 