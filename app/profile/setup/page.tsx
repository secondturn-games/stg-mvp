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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, User, MapPin, Camera, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'

// Profile setup schema
const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  country: z.enum(['Latvia', 'Estonia', 'Lithuania'], {
    required_error: 'Please select your country'
  }),
  city: z.string().min(2, 'City must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileSetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState({
    verified: true,
    username: false,
    avatar: false,
    location: false
  })
  
  const router = useRouter()
  const { user, profile, refreshProfile, isLoading } = useAuth()

  // Wait for auth to load before rendering form
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-vibrant-orange mx-auto mb-4" />
          <p className="text-dark-green">Loading...</p>
        </div>
      </div>
    )
  }

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || user.email?.split('@')[0] || '',
      country: profile?.country || undefined,
      city: profile?.city || '',
      bio: profile?.bio || ''
    }
  })

  // Check if user is verified
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      router.push('/join/verify')
    }
  }, [user]) // Removed router from dependencies

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || user.email?.split('@')[0] || '',
        country: profile.country || undefined,
        city: profile.city || '',
        bio: profile.bio || ''
      })
    }
  }, [profile, user.email, form])

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) return
    
    setIsCheckingUsername(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .neq('id', user?.id || '')
        .single()
      
      setUsernameAvailable(!data)
    } catch (err) {
      setUsernameAvailable(true)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target?.result as string)
      reader.readAsDataURL(file)
      setProgress(prev => ({ ...prev, avatar: true }))
    }
  }

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null
    
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      return publicUrl
    } catch (err) {
      console.error('Avatar upload error:', err)
      return null
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      let avatarUrl = profile?.avatar || null
      
      // Upload avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: data.username,
          country: data.country,
          city: data.city,
          bio: data.bio || null,
          avatar: avatarUrl
        })
        .eq('id', user?.id)
      
      if (updateError) throw updateError
      
      // Refresh profile data
      await refreshProfile()
      
      // Redirect to browse games
      router.push('/games')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update progress based on form state
  useEffect(() => {
    const values = form.getValues()
    setProgress({
      verified: true,
      username: !!values.username && usernameAvailable === true,
      avatar: !!avatarFile || !!profile?.avatar,
      location: !!(values.country && values.city)
    })
  }, [form.watch(), usernameAvailable, avatarFile, profile?.avatar])

  if (!user || !user.email_confirmed_at) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-light-beige flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-dark-green">Complete Your Profile</CardTitle>
          <CardDescription className="text-gray-600">
            Set up your profile to start listing and messaging
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress Checklist */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">Email verified</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {progress.username ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <span className={progress.username ? "text-gray-600" : "text-gray-400"}>
                Username set
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {progress.avatar ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <span className={progress.avatar ? "text-gray-600" : "text-gray-400"}>
                Avatar uploaded
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {progress.location ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <span className={progress.location ? "text-gray-600" : "text-gray-400"}>
                Location set
              </span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-dark-green font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-vibrant-orange" />
                Username *
              </Label>
              <Input
                id="username"
                {...form.register('username')}
                placeholder="Choose a unique username"
                className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
                onBlur={(e) => checkUsername(e.target.value)}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {form.formState.errors.username.message}
                </p>
              )}
              {usernameAvailable === true && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Username available
                </p>
              )}
              {usernameAvailable === false && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Username taken
                </p>
              )}
              {isCheckingUsername && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking availability...
                </p>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-dark-green font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-vibrant-orange" />
                Profile Picture
              </Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={avatarPreview || profile?.avatar || undefined} />
                  <AvatarFallback className="bg-vibrant-orange text-white font-semibold text-lg">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="avatar"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Choose Image
                  </Label>
                </div>
              </div>
            </div>

            {/* Country Field */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-dark-green font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-vibrant-orange" />
                Country *
              </Label>
              <Select onValueChange={(value) => form.setValue('country', value as any)} defaultValue={form.getValues('country')}>
                <SelectTrigger className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Latvia">🇱🇻 Latvia</SelectItem>
                  <SelectItem value="Estonia">🇪🇪 Estonia</SelectItem>
                  <SelectItem value="Lithuania">🇱🇹 Lithuania</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.country && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>

            {/* City Field */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-dark-green font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-vibrant-orange" />
                City *
              </Label>
              <Input
                id="city"
                {...form.register('city')}
                placeholder="Enter your city"
                className="h-12 border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
              />
              {form.formState.errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-dark-green font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-vibrant-orange" />
                Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                {...form.register('bio')}
                placeholder="Tell us about yourself..."
                className="min-h-[80px] border-light-beige focus:border-vibrant-orange focus:ring-vibrant-orange/20 placeholder:text-gray-400"
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold text-lg rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isSubmitting || !form.formState.isValid || !usernameAvailable}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up profile...
                </div>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
