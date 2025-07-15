import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ games: [] });
    }

    // Search games by title (case-insensitive) - fixed PostgreSQL syntax
    const { data: games, error } = await supabase
      .from('games')
      .select('id, title')
      .or(`title->>'en'.ilike.%${query}%,title->>'et'.ilike.%${query}%`)
      .limit(10)
      .order('title->en');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to search games' },
        { status: 500 }
      );
    }

    return NextResponse.json({ games: games || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
