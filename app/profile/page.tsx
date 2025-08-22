'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/protected-route'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, User, MapPin, Globe, FileText, AtSign, Loader2, Settings, Package, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LV, EE, LT } from 'country-flag-icons/react/3x2'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.enum(['Estonia', 'Latvia', 'Lithuania', 'OTHER'])
})

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { profile, updateProfile, signOut, user, loading: authLoading, forceResetAuthState } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Form setup
  const defaultValues = useMemo(() => ({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    city: profile?.city || '',
    country: profile?.country || 'Latvia'
  }), [profile])

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues
  })

  const { register, handleSubmit, formState: { isDirty }, setValue, reset } = form

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
        city: profile.city || '',
        country: profile.country || 'Latvia'
      })
    }
  }, [profile, reset])

  // Detect user's country for better defaults
  const detectUserCountry = useCallback(async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      const country = data.country_name
      
      if (country === 'Estonia' || country === 'Latvia' || country === 'Lithuania') {
        return country
      }
      return 'Latvia' // Default fallback
    } catch (error) {
      console.error('Error detecting country:', error)
      return 'Latvia' // Default fallback
    }
  }, [])

  // Set default country on component mount
  useEffect(() => {
    if (!profile?.country) {
      detectUserCountry().then(country => {
        setValue('country', country as 'Estonia' | 'Latvia' | 'Lithuania' | 'OTHER')
      })
    }
  }, [profile?.country, detectUserCountry, setValue])

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return

    setIsLoading(true)

    try {
      const updateResult = await updateProfile({
        username: data.username,
        full_name: data.full_name,
        city: data.city,
        country: data.country
      })

      if (!updateResult.error) {
        toast({
          title: "Profile updated successfully!",
          description: "Your profile has been saved.",
          duration: 3000
        })
        reset(data)
      } else {
        toast({
          title: "Update failed",
          description: updateResult.error.error || "Failed to update profile",
          variant: "destructive",
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Sign out failed",
        description: "Please try again or refresh the page.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Loading your profile...</p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={forceResetAuthState} 
              variant="outline" 
              size="sm"
              className="ml-2"
            >
              Reset Auth State
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-light-beige">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Dashboard Header */}
                      <div className="mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h1 className="hidden lg:block text-3xl font-bold text-dark-green">My Dashboard</h1>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="hidden lg:flex text-gray-600 hover:text-vibrant-orange w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave the Table
              </Button>
            </div>
            
            {/* Profile Summary Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={profile?.avatar || undefined} 
                        alt={profile?.username || 'Profile'} 
                      />
                      <AvatarFallback className="bg-vibrant-orange text-white font-semibold text-lg">
                        {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-vibrant-orange">{profile?.username || user?.email?.split('@')[0]}</h2>
                      {profile?.country && (
                        <div className="flex items-center">
                          {profile.country === 'Latvia' && <LV title="Latvia" className="w-4 h-3" />}
                          {profile.country === 'Estonia' && <EE title="Estonia" className="w-4 h-3" />}
                          {profile.country === 'Lithuania' && <LT title="Lithuania" className="w-4 h-3" />}
                          {profile.country === 'OTHER' && <Globe className="w-4 h-3 text-gray-400" />}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Navigation Tabs */}
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              {/* Tab Navigation Row */}
              <div className="bg-light-beige p-1 rounded-lg mb-6">
                {/* Mobile: Icon-based horizontal tabs */}
                <div className="block lg:hidden">
                  <div className="flex w-full">
                    {[
                      { value: 'profile', icon: User, label: 'Profile' },
                      { value: 'listings', icon: Package, label: 'Listings' },
                      { value: 'saved', icon: Star, label: 'Saved Games' },
                      { value: 'activity', icon: AtSign, label: 'Activity' },
                      { value: 'settings', icon: Settings, label: 'Settings' }
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex-1 py-3 px-2 text-center transition-all duration-200 ${
                          activeTab === tab.value
                            ? 'bg-white text-vibrant-orange shadow-sm rounded-lg'
                            : 'text-dark-green hover:text-dark-green/80'
                        }`}
                        title={tab.label}
                      >
                        <tab.icon className="w-5 h-5 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop: Text-based horizontal tabs */}
                <div className="hidden lg:block">
                  <div className="flex w-full">
                    {[
                      { value: 'profile', label: 'Profile' },
                      { value: 'listings', label: 'Listings' },
                      { value: 'saved', label: 'Saved Games' },
                      { value: 'activity', label: 'Activity' },
                      { value: 'settings', label: 'Settings' }
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === tab.value
                            ? 'bg-white text-vibrant-orange shadow-sm'
                            : 'text-dark-green hover:text-dark-green/80'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: Simple conditional rendering */}
              <div className="block lg:hidden">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-dark-green mb-4">Profile Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="username" className="text-dark-green font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-vibrant-orange" />
                                Username
                              </Label>
                              <Input
                                id="username"
                                {...register('username')}
                                placeholder="Enter your username"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="full_name" className="text-dark-green font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4 text-vibrant-orange" />
                                Full Name
                              </Label>
                              <Input
                                id="full_name"
                                {...register('full_name')}
                                placeholder="Enter your full name"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="country" className="text-dark-green font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4 text-vibrant-orange" />
                                Country
                              </Label>
                              <Select onValueChange={(value) => setValue('country', value as 'Estonia' | 'Latvia' | 'Lithuania' | 'OTHER')} defaultValue={form.getValues('country')}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Latvia">
                                    <div className="flex items-center">
                                      <LV title="Latvia" className="w-4 h-3 mr-2" />
                                      Latvia
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Estonia">
                                    <div className="flex items-center">
                                      <EE title="Estonia" className="w-4 h-3 mr-2" />
                                      Estonia
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Lithuania">
                                    <div className="flex items-center">
                                      <LT title="Lithuania" className="w-4 h-3 mr-2" />
                                      Lithuania
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-dark-green font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-vibrant-orange" />
                                City
                              </Label>
                              <Input
                                id="city"
                                {...register('city')}
                                placeholder="Enter your city"
                                className="w-full"
                              />
                            </div>

                            <Button
                              type="submit"
                              className={`w-full h-12 font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                                isDirty
                                  ? 'bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={isLoading || !isDirty}
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Saving...
                                </div>
                              ) : isDirty ? (
                                'Save Changes'
                              ) : (
                                'No Changes to Save'
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'listings' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Listings Yet</h3>
                      <p className="text-gray-600">Start selling your games to the community</p>
                    </div>
                  </div>
                )}

                {activeTab === 'saved' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Saved Games</h3>
                      <p className="text-gray-600">Save games you're interested in</p>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <AtSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Recent Activity</h3>
                      <p className="text-gray-600">Your activity will appear here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">Settings</h3>
                      <p className="text-gray-600">Manage your account preferences</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Conditional rendering with same logic */}
              <div className="hidden lg:block">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <div className="space-y-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="username" className="text-dark-green font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-vibrant-orange" />
                                Username
                              </Label>
                              <Input
                                id="username"
                                {...register('username')}
                                placeholder="Enter your username"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="full_name" className="text-dark-green font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4 text-vibrant-orange" />
                                Full Name
                              </Label>
                              <Input
                                id="full_name"
                                {...register('full_name')}
                                placeholder="Enter your full name"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="country" className="text-dark-green font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4 text-vibrant-orange" />
                                Country
                              </Label>
                              <Select onValueChange={(value) => setValue('country', value as 'Estonia' | 'Latvia' | 'Lithuania' | 'OTHER')} defaultValue={form.getValues('country')}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Latvia">
                                    <div className="flex items-center">
                                      <LV title="Latvia" className="w-4 h-3 mr-2" />
                                      Latvia
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Estonia">
                                    <div className="flex items-center">
                                      <EE title="Estonia" className="w-4 h-3 mr-2" />
                                      Estonia
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Lithuania">
                                    <div className="flex items-center">
                                      <LT title="Lithuania" className="w-4 h-3 mr-2" />
                                      Lithuania
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-dark-green font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-vibrant-orange" />
                                City
                              </Label>
                              <Input
                                id="city"
                                {...register('city')}
                                placeholder="Enter your city"
                                className="w-full"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className={`w-full h-12 font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                              isDirty
                                ? 'bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={isLoading || !isDirty}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                              </div>
                            ) : isDirty ? (
                              'Save Changes'
                            ) : (
                              'No Changes to Save'
                            )}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'listings' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Listings Yet</h3>
                      <p className="text-gray-600">Start selling your games to the community</p>
                    </div>
                  </div>
                )}

                {activeTab === 'saved' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Saved Games</h3>
                      <p className="text-gray-600">Save games you're interested in</p>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <AtSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">No Recent Activity</h3>
                      <p className="text-gray-600">Your activity will appear here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vibrant-orange mb-2">Settings</h3>
                      <p className="text-gray-600">Manage your account preferences</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mobile: Leave the Table button at bottom */}
          <div className="block lg:hidden mt-8">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-gray-600 hover:text-vibrant-orange border-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave the Table
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
