import { type NextRequest, NextResponse } from "next/server"
import { bggService } from "@/lib/bgg-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = await params

  if (!gameId || !/^\d+$/.test(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 })
  }

  try {
    const gameDetails = await bggService.getGameDetails(gameId)

    if (!gameDetails) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Cache the game data in our database
    await bggService.cacheGameData(gameDetails)

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
