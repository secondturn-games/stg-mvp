import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 })
    }

    const supabaseClient = createServerSupabaseClient()

    // Check if username exists
    const { data, error } = await supabaseClient
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which means username is available
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
    }

    // If no data found, username is available
    const available = !data

    return NextResponse.json({ 
      available,
      username,
      message: available ? 'Username is available' : 'Username is already taken'
    })

  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
