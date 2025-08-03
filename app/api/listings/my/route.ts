import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"

// GET - Get current user's listings
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "all"

    let query = supabase
      .from('listings')
      .select(`
        *,
        game:games(id, name, yearPublished, thumbnail, bggRating)
      `)
      .eq('userId', user.id)

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count } = await query

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('createdAt', { ascending: false })

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
    console.error('Error fetching user listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
} 