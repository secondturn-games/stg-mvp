import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ games: [] })
    }

    // Search games by title (case-insensitive) - fixed PostgreSQL syntax
    const { data: games, error } = await supabase
      .from('games')
      .select('id, title')
      .or(`title->>'en'.ilike.%${query}%,title->>'et'.ilike.%${query}%`)
      .limit(10)
      .order('title->en')

    if (error) {
      console.error('Error searching games:', error)
      return NextResponse.json({ games: [] })
    }

    return NextResponse.json({ games: games || [] })

  } catch (error) {
    console.error('Error in game search:', error)
    return NextResponse.json({ games: [] })
  }
} 