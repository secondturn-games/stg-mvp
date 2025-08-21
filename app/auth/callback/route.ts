import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('🔍 OAuth Callback Debug:')
  console.log('Request URL:', request.url)
  console.log('Origin:', requestUrl.origin)
  console.log('Code present:', !!code)
  console.log('Code length:', code?.length || 0)

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      console.log('🔄 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        console.log('✅ User authenticated:', data.user.id)
        console.log('📧 User email:', data.user.email)
        
        // Check if user profile is complete
        console.log('🔍 Checking user profile...')
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('username, country')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.log('⚠️ Profile error:', profileError)
        } else {
          console.log('📋 Profile data:', profile)
        }
        
        // Detect current environment for redirects
        const currentOrigin = requestUrl.origin
        const isVercelPreview = currentOrigin.includes('vercel.app')
        const baseUrl = isVercelPreview 
          ? currentOrigin 
          : (process.env.NEXT_PUBLIC_APP_URL || currentOrigin)
        
        console.log('🌍 Environment detection:')
        console.log('Current origin:', currentOrigin)
        console.log('Is Vercel preview:', isVercelPreview)
        console.log('Base URL:', baseUrl)
        
        // Redirect based on profile completion
        if (profile && profile.username && profile.country) {
          const redirectUrl = `${baseUrl}/games`
          console.log('🎯 Redirecting to games:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        } else {
          // Ensure we redirect to profile setup for incomplete profiles
          const redirectUrl = `${baseUrl}/profile/setup`
          console.log('🎯 Redirecting to profile setup:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        console.error('❌ OAuth error:', error)
        // Redirect to join page on error
        const redirectUrl = `${requestUrl.origin}/join`
        console.log('🎯 Redirecting to join (error):', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('💥 OAuth callback error:', err)
      // Redirect to join page on error
      const redirectUrl = `${requestUrl.origin}/join`
      console.log('🎯 Redirecting to join (exception):', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Fallback redirect to join page
  console.log('⚠️ No code provided, redirecting to join')
  const redirectUrl = `${requestUrl.origin}/join`
  console.log('🎯 Fallback redirect to join:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}
