import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test listings table
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Listings table accessible',
      count: data?.length || 0
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 