'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Navigation } from '@/components/navigation'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.enum(['estonia', 'latvia', 'lithuania']),
  language: z.enum(['en', 'et', 'lv', 'lt']),
  bio: z.string().optional()
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { profile, updateProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      city: profile?.city || '',
      country: profile?.country || 'latvia',
      language: profile?.language || 'en',
      bio: profile?.bio || ''
    }
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile && !isLoading) {
      reset({
        username: profile.username,
        full_name: profile.full_name || '',
        city: profile.city,
        country: profile.country,
        language: profile.language,
        bio: profile.bio || ''
      })
    }
  }, [profile, isLoading, reset])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await updateProfile(data)

      if (error) {
        setError(error.message)
      } else {
        setMessage('Profile updated successfully!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Select onValueChange={(value) => setValue('country', value as any)} defaultValue={profile?.country}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select onValueChange={(value) => setValue('language', value as any)} defaultValue={profile?.language}>
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

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
