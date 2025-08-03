import { type NextRequest, NextResponse } from "next/server"
import { bggService } from "@/lib/bgg-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const gameType = searchParams.get('gameType') || 'base-game'
  const debug = searchParams.get('debug') === 'true'

  if (!query) {
    return NextResponse.json({ 
      success: false, 
      error: "Query parameter is required" 
    }, { status: 400 })
  }

  if (query.trim().length < 2) {
    return NextResponse.json({ 
      success: false, 
      error: "Query must be at least 2 characters" 
    }, { status: 400 })
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase environment variables")
    return NextResponse.json({ 
      success: false,
      error: "Server configuration error",
      details: "Missing Supabase credentials"
    }, { status: 500 })
  }

  try {
    // Clear cache if debug mode is enabled
    if (debug) {
      bggService.clearSearchCache()
    }

    console.log(`🔍 Starting search for: "${query}" with game type: ${gameType}`)
    
    const results = await bggService.searchGames(query.trim(), {
      gameType: gameType as 'base-game' | 'expansion'
    })
    
    console.log(`✅ Search completed, found ${results.length} results`)

    // Add debugging info for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`BGG Search for "${query}":`, results.map(r => `${r.id}: ${r.name} (${r.type})`))
      
      // Debug character encoding
      if (results.some(r => r.name.includes('Märklin') || r.name.includes('MÃ¤rklin'))) {
        console.log('Found Märklin game, checking encoding:')
        results.forEach(r => {
          if (r.name.includes('Märklin') || r.name.includes('MÃ¤rklin')) {
            console.log('Game name bytes:', Buffer.from(r.name, 'utf8'))
            console.log('Game name:', r.name)
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error("❌ BGG Search Error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      query: query,
      gameType: gameType,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    })
    
    // Return a more detailed error response for debugging
    return NextResponse.json({ 
      success: false,
      error: "Failed to search BoardGameGeek",
      details: error instanceof Error ? error.message : 'Unknown error',
      query: query
    }, { status: 500 })
  }
}
