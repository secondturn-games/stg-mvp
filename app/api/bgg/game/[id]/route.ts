import { type NextRequest, NextResponse } from "next/server"
import { bggService } from "@/lib/bgg"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = await params
  const { searchParams } = new URL(request.url)
  const forceRefresh = searchParams.get('refresh') === 'true'

  if (!gameId || !/^\d+$/.test(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
  }

  try {
    // Clear cache if force refresh is requested
    if (forceRefresh) {
      console.log(`🔄 Force refreshing game details for: ${gameId}`)
      bggService.clearSearchCacheForQuery(gameId)
    }

    const gameDetails = await bggService.getGameDetails(gameId)

    if (!gameDetails) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Debug logging to verify data is being fetched
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎮 Game details for ${gameId}:`, {
        name: gameDetails.name,
        rating: gameDetails.rating,
        weight: gameDetails.weight,
        rank: gameDetails.rank,
        mechanics: gameDetails.mechanics?.length || 0,
        categories: gameDetails.categories?.length || 0,
        versions: gameDetails.versions?.length || 0
      })
    }

    return NextResponse.json({
      success: true,
      game: gameDetails,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error("BGG Game Details Error:", error)
    return NextResponse.json({ error: "Failed to fetch game details from BoardGameGeek" }, { status: 500 })
  }
}
