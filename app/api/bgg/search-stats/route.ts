import { NextResponse } from 'next/server'
import { BGGService } from '@/lib/bgg'

export async function GET() {
  try {
    const bggService = new BGGService()
    const stats = bggService.getCacheStats()
    const popularQueries = bggService.getPopularQueries()
    
    return NextResponse.json({
      success: true,
      stats,
      popularQueries,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get search stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get search statistics' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const bggService = new BGGService()
    bggService.clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'Search cache cleared successfully'
    })
  } catch (error) {
    console.error('Failed to clear search cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear search cache' },
      { status: 500 }
    )
  }
} 