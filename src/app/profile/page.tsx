import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile, getUserStats } from '@/lib/user-service'
import ProfileForm from '@/components/profile/ProfileForm'
import UserStats from '@/components/profile/UserStats'

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const profile = await getCurrentUserProfile()
  const stats = profile ? await getUserStats(profile.id) : null

  if (!profile) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-4">
          Your profile hasn't been created yet. Please complete your profile setup.
        </p>
        <a 
          href="/profile/setup" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Set Up Profile
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <ProfileForm profile={profile} />
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <UserStats stats={stats} />
          
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified Seller</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  profile.verified_seller 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.verified_seller ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bank Verified</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  profile.bank_verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.bank_verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Country</span>
                <span className="text-sm font-medium">{profile.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language</span>
                <span className="text-sm font-medium">{profile.preferred_language.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 