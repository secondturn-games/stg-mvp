import { NextRequest, NextResponse } from 'next/server'
import { bggService } from '@/lib/bgg-service'

export async function POST(request: NextRequest) {
  try {
    await bggService.cleanupExpiredCache()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expired cache entries cleaned up successfully' 
    })
  } catch (error) {
    console.error('Cache cleanup failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup cache' },
      { status: 500 }
    )
  }
} 