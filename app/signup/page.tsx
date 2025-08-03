'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.enum(['estonia', 'latvia', 'lithuania']),
  language: z.enum(['en', 'et', 'lv', 'lt'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signUp(data.email, data.password, {
        username: data.username,
        full_name: data.full_name,
        city: data.city,
        country: data.country,
        language: data.language
      })

      if (error) {
        setError(error.message)
      } else {
        // Redirect to login with success message
        router.push('/login?message=Please check your email to confirm your account')
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
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Second Turn Games to buy and sell board games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="username"
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
                                  <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      placeholder="Your full name"
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-600">{errors.full_name.message}</p>
                    )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Your city"
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => setValue('country', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latvia">Latvia</SelectItem>
                  <SelectItem value="estonia">Estonia</SelectItem>
                  <SelectItem value="lithuania">Lithuania</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select onValueChange={(value) => setValue('language', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="lv">Latviešu</SelectItem>
                  <SelectItem value="et">Eesti</SelectItem>
                  <SelectItem value="lt">Lietuvių</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-sm text-red-600">{errors.language.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
