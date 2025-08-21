'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
  requireProfile?: boolean
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requireVerification = true, 
  requireProfile = false,
  redirectTo = '/join/verify'
}: RouteGuardProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // Memoize redirect functions to prevent infinite loops
  const redirectToJoin = useCallback(() => {
    router.push('/join')
  }, [router])

  const redirectToVerify = useCallback((email: string) => {
    router.push(`/join/verify?email=${encodeURIComponent(email)}`)
  }, [router])

  const redirectToProfileSetup = useCallback(() => {
    router.push('/profile/setup')
  }, [router])

  useEffect(() => {
    if (isLoading) return

    // If not authenticated, redirect to join
    if (!user) {
      redirectToJoin()
      return
    }

    // If verification required but not verified
    if (requireVerification && !user.email_confirmed_at) {
      redirectToVerify(user.email || '')
      return
    }

    // If profile completion required but profile incomplete
    if (requireProfile && (!profile?.username || !profile?.country)) {
      redirectToProfileSetup()
      return
    }

    setIsChecking(false)
  }, [user, profile, isLoading, requireVerification, requireProfile, redirectToJoin, redirectToVerify, redirectToProfileSetup])

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-vibrant-orange mx-auto mb-4" />
          <p className="text-dark-green">Loading...</p>
        </div>
      </div>
    )
  }

  // If all checks pass, render children
  return <>{children}</>
}
