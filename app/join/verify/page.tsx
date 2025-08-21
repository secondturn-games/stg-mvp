'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Home, CheckCircle, Clock, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/db'

export default function VerifyPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    // Start countdown for resend button
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = async () => {
    if (!email) return
    
    setIsResending(true)
    setError(null)
    
    try {
      // Dynamic redirectTo for different environments
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const isVercelPreview = currentOrigin.includes('vercel.app')
      const baseUrl = isVercelPreview ? currentOrigin : (process.env.NEXT_PUBLIC_APP_URL || currentOrigin)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          redirectTo: `${baseUrl}/auth/verify`
        }
      })
      
      if (error) {
        // Enhanced error handling for different error types
        if (error.message?.includes('Database error') || error.message?.includes('service')) {
          setError('We\'re experiencing technical difficulties. Please try again in a few minutes or contact support if the issue persists.')
        } else if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          setError('Too many resend attempts. Please wait before trying again.')
        } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
          setError('Connection issue detected. Please check your internet connection and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setResendSuccess(true)
        setResendDisabled(true)
        setResendCountdown(60)
        
        // Reset success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (err) {
      console.error('Unexpected error during resend:', err)
      setError('We\'re experiencing technical difficulties. Please try again in a few minutes.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-beige flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-dark-green">Almost there!</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a verification link to your email:
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Verification email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {/* Email Display */}
          {email && (
            <div className="text-center p-4 bg-light-beige rounded-lg">
              <p className="font-medium text-dark-green">{email}</p>
            </div>
          )}

          {/* Tips - positioned between email and resend button */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Can take a minute to arrive</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Email will be from Supabase Auth</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-gray-400" />
              <span>Check your spam folder</span>
            </div>
          </div>

          {/* Resend Button */}
          <Button
            onClick={handleResend}
            disabled={resendDisabled || isResending}
            className="w-full h-12 font-semibold rounded-2xl shadow-lg transition-all duration-200"
          >
            {isResending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </div>
            ) : resendDisabled ? (
              `Resend email (${resendCountdown}s)`
            ) : (
              'Resend verification email'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
