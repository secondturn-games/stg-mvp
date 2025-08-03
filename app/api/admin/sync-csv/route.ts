import { NextRequest, NextResponse } from 'next/server'
import { syncCSVToSupabase } from '@/lib/supabase-csv-sync'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check here
    // For now, this is a simple admin endpoint
    
    console.log('🔄 Admin CSV sync requested')
    
    await syncCSVToSupabase()
    
    return NextResponse.json({ 
      success: true, 
      message: 'CSV sync completed successfully' 
    })
    
  } catch (error) {
    console.error('❌ Admin CSV sync failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'CSV sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 