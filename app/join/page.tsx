'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Loader2, Mail, Lock, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/db'

// Unified form schema
const unifiedSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain lowercase, uppercase, digit and symbol')
})

type UnifiedForm = z.infer<typeof unifiedSchema>

export default function JoinPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const router = useRouter()
  const { signUp, signIn, profile } = useAuth()

  // Unified form
  const form = useForm<UnifiedForm>({
    resolver: zodResolver(unifiedSchema)
  })

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      // Let the server-side OAuth callback handle the redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
        // Remove redirectTo - let the callback route handle it
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (error) {
      setError('Failed to sign in with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof unifiedSchema>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try to sign in first
      const signInResult = await signIn(data.email, data.password)
      
      if (signInResult.error) {
        // If sign in fails, try to sign up
        const signUpResult = await signUp(data.email, data.password, {})
        
        if (signUpResult.error) {
          // Enhanced error handling for different error types
          if (signUpResult.error.message?.includes('Database error')) {
            setError('We\'re experiencing technical difficulties. Please try again in a few minutes or contact support if the issue persists.')
          } else if (signUpResult.error.message?.includes('network') || signUpResult.error.message?.includes('timeout')) {
            setError('Connection issue detected. Please check your internet connection and try again.')
          } else if (signUpResult.error.message?.includes('rate limit')) {
            setError('Too many attempts. Please wait a moment before trying again.')
          } else {
            setError(signUpResult.error.message || 'An unexpected error occurred. Please try again.')
          }
        } else {
          // Account created successfully - redirect to verification
          router.push(`/join/verify?email=${encodeURIComponent(data.email)}`)
        }
      } else {
        // Sign in successful - check if profile is complete
        if (profile && profile.username && profile.country) {
          router.push('/games')
        } else {
          router.push('/profile/setup')
        }
      }
    } catch (err) {
      // Handle unexpected errors
      console.error('Unexpected error during auth:', err)
      setError('We\'re experiencing technical difficulties. Please try again in a few minutes.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-light-beige flex items-start justify-center pt-24 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-dark-green">Join the Table</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Give your games a second turn, and find your next one
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google OAuth - Primary Option */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 font-medium shadow-lg rounded-2xl"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="truncate">
                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">or</span>
              </div>
            </div>

            {/* Collapsible Email Form */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full h-12 border-dark-green text-dark-green hover:bg-dark-green/5 active:bg-dark-green/10 transition-all duration-200 relative rounded-2xl"
              >
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Continue with Email</span>
                {showEmailForm ? (
                  <ChevronUp className="w-4 h-4 absolute right-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 absolute right-3" />
                )}
              </Button>

              {/* Email Form */}
              {showEmailForm && (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4 border-t border-gray-100">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-dark-green font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-vibrant-orange" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="your@email.com"
                      className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-dark-green font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-vibrant-orange" />
                      Password
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          At least 8 characters, lowercase, uppercase letters, digits and symbols
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register('password')}
                      placeholder="••••••••"
                      className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isLoading || !form.formState.isValid}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Continuing...
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
