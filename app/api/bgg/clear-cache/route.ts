import { type NextRequest, NextResponse } from "next/server"
import { bggService } from "@/lib/bgg-service"

export async function POST(request: NextRequest) {
  try {
    // Clear the search cache
    bggService.clearSearchCache()
    
    console.log('🗑️ Search cache cleared via API endpoint')
    
    return NextResponse.json({
      success: true,
      message: "Search cache cleared successfully"
    })
  } catch (error) {
    console.error("❌ Cache Clear Error:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to clear cache",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 