import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile is complete
      const { data: profile } = await supabase
        .from('users')
        .select('username, country')
        .eq('id', data.user.id)
        .single()
      
      // Detect current environment for redirects
      const currentOrigin = requestUrl.origin
      const isVercelPreview = currentOrigin.includes('vercel.app')
      const baseUrl = isVercelPreview 
        ? currentOrigin 
        : (process.env.NEXT_PUBLIC_APP_URL || currentOrigin)
      
      // Redirect based on profile completion
      if (profile && profile.username && profile.country) {
        return NextResponse.redirect(`${baseUrl}/games`)
      } else {
        return NextResponse.redirect(`${baseUrl}/profile/setup`)
      }
    }
  }
  
  // Fallback redirect
  return NextResponse.redirect(requestUrl.origin)
}
