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
import { X, Loader2, Mail, Lock, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/db'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Signup schema
const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain lowercase, uppercase, digit and symbol')
})

// Signin schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type SignUpForm = z.infer<typeof signUpSchema>
type SignInForm = z.infer<typeof signInSchema>

export default function JoinPage() {
  const [activeTab, setActiveTab] = useState('signup')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { signUp, signIn } = useAuth()

  // Signup form
  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema)
  })

  // Signin form
  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema)
  })



  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
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

  const onSignUp = async (data: SignUpForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signUp(data.email, data.password, {})

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const onSignIn = async (data: SignInForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password)

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-beige flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-dark-green">Join the Table</CardTitle>
          <CardDescription className="text-gray-600">
            Start your board game journey in under 30 seconds
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
              className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 font-medium shadow-sm"
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
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Tabs for Email Options */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">New Player</TabsTrigger>
                <TabsTrigger value="signin">Returning Player</TabsTrigger>
              </TabsList>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="w-full h-12 border-light-beige text-dark-green hover:bg-light-beige/50 active:bg-light-beige/30 transition-all duration-200"
                >
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Sign up with email</span>
                  {showEmailForm ? (
                    <ChevronUp className="w-4 h-4 ml-auto flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                  )}
                </Button>

                {/* Email Signup Form */}
                {showEmailForm && (
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-5 pt-4 border-t border-gray-100">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-dark-green font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-vibrant-orange" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        {...signUpForm.register('email')}
                        placeholder="your@email.com"
                        className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                      />
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                                             <Label htmlFor="signup-password" className="text-dark-green font-medium flex items-center gap-2">
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
                        id="signup-password"
                        type="password"
                        {...signUpForm.register('password')}
                        placeholder="••••••••"
                        className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                      />
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>





                    {/* Submit Button */}
                                         <Button 
                       type="submit" 
                       className="w-full h-12 bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                       disabled={isLoading || !signUpForm.formState.isValid}
                     >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating your account...
                        </div>
                      ) : (
                        'Join the Table'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* Signin Tab */}
              <TabsContent value="signin" className="space-y-4 pt-4">
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-dark-green font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-vibrant-orange" />
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      {...signInForm.register('email')}
                      placeholder="your@email.com"
                      className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-dark-green font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-vibrant-orange" />
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      {...signInForm.register('password')}
                      placeholder="••••••••"
                      className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isLoading || !signInForm.formState.isValid}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      'Welcome Back!'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


          </div>
        </CardContent>
      </Card>
    </div>
  )
}
