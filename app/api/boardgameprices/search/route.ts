import { type NextRequest, NextResponse } from "next/server"

interface BoardGamePricesResult {
  id: string
  name: string
  image: string
  minPrice: number
  maxPrice: number
  currency: string
  stores: Array<{
    name: string
    price: number
    url: string
    inStock: boolean
    shipping?: number
  }>
  lastUpdated: string
}

// Mock data for prototype - in production, this would call the actual API
function getMockPriceData(query: string): BoardGamePricesResult[] {
  const mockData = [
    {
      id: "wingspan",
      name: "Wingspan",
      image: "/placeholder.svg?height=100&width=100&text=Wingspan",
      minPrice: 45.99,
      maxPrice: 52.99,
      currency: "EUR",
      stores: [
        { name: "Philibert", price: 45.99, url: "#", inStock: true, shipping: 4.99 },
        { name: "Spiel-Offensive", price: 47.5, url: "#", inStock: true, shipping: 5.99 },
        { name: "BoardGamesMaster", price: 52.99, url: "#", inStock: false },
      ],
      lastUpdated: "2024-01-20T10:30:00Z",
    },
    {
      id: "azul",
      name: "Azul",
      image: "/placeholder.svg?height=100&width=100&text=Azul",
      minPrice: 32.99,
      maxPrice: 39.99,
      currency: "EUR",
      stores: [
        { name: "Philibert", price: 32.99, url: "#", inStock: true, shipping: 4.99 },
        { name: "Fantasywelt", price: 35.5, url: "#", inStock: true, shipping: 3.99 },
        { name: "BoardGamesMaster", price: 39.99, url: "#", inStock: true },
      ],
      lastUpdated: "2024-01-20T09:15:00Z",
    },
  ]

  return mockData.filter((game) => game.name.toLowerCase().includes(query.toLowerCase()))
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
  }

  try {
    // In production, this would be:
    // const response = await fetch(`https://api.boardgameprices.eu/search?q=${encodeURIComponent(query)}`)
    // const data = await response.json()

    const results = getMockPriceData(query)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("BoardGamePrices API Error:", error)
    return NextResponse.json({ error: "Failed to fetch price data" }, { status: 500 })
  }
}
