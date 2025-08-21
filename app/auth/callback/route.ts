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
    
    try {
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
          // Ensure we redirect to profile setup for incomplete profiles
          console.log('Redirecting to profile setup for user:', data.user.id)
          return NextResponse.redirect(`${baseUrl}/profile/setup`)
        }
      } else {
        console.error('OAuth error:', error)
        // Redirect to join page on error
        return NextResponse.redirect(`${requestUrl.origin}/join`)
      }
    } catch (err) {
      console.error('OAuth callback error:', err)
      // Redirect to join page on error
      return NextResponse.redirect(`${requestUrl.origin}/join`)
    }
  }
  
  // Fallback redirect to join page
  console.log('No code provided, redirecting to join')
  return NextResponse.redirect(`${requestUrl.origin}/join`)
}
