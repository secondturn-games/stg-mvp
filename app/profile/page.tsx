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
import { LogOut } from 'lucide-react'


const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.enum(['Estonia', 'Latvia', 'Lithuania']),
  language: z.enum(['en', 'et', 'lv', 'lt']),
  bio: z.string().optional()
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { profile, updateProfile, signOut } = useAuth()

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
      country: profile?.country || 'Latvia',
      language: profile?.language || 'en',
      bio: profile?.bio || ''
    }
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile && !isLoading) {
      reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
        city: profile.city || '',
        country: profile.country || 'Latvia',
        language: profile.language || 'en',
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

                {/* Divider */}
                <div className="my-8 border-t border-gray-200" />

                {/* Sign Out Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your account and session
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        await signOut()
                        window.location.href = '/'
                      } catch (error) {
                        console.error('Sign out error:', error)
                        // Fallback redirect even if signOut fails
                        window.location.href = '/'
                      }
                    }}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave the Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
