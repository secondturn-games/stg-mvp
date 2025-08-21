import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect_to')

  // If this is an email verification, redirect to the specified URL
  if (token && type === 'signup' && redirectTo) {
    return NextResponse.redirect(redirectTo)
  }

  // Fallback: redirect to home
  return NextResponse.redirect(requestUrl.origin)
}
