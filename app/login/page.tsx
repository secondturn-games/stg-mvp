'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()

  // Check for success message from signup
  useEffect(() => {
    const successMessage = searchParams.get('message')
    if (successMessage) {
      setMessage(successMessage)
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password)

      if (error) {
        setError(error.message)
      } else {
        // Redirect to home page
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Second Turn Games account
          </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

              <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                {...register('email')}
                  placeholder="your@email.com"
                />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
              </div>

              <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
              </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
            
            <p className="text-sm text-gray-600">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
