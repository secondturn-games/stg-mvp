import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// GET - Fetch single listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Fetching listing:', id)

    const { data: listing, error } = await supabase
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
          is_verified,
          created_at
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
    }

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    console.log('✅ Listing fetched successfully:', listing.title)

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}