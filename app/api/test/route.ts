import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test basic database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 