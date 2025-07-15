import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserProfile, userProfileExists } from '@/lib/user-service'

export default async function DebugProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Not Authenticated</h1>
        <p>Please sign in first to test the profile system.</p>
        <a href="/sign-in" className="text-blue-600 hover:underline">Sign In</a>
      </div>
    )
  }

  try {
    // Get user from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress

    // Check if profile exists
    const profileExists = email ? await userProfileExists(email) : false
    const currentProfile = await getCurrentUserProfile()

    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">🔍 Profile Debug Information</h1>
        
        <div className="grid gap-6">
          {/* Clerk Information */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Clerk User Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Clerk User ID:</strong> {userId}</p>
              <p><strong>Email:</strong> {email || 'No email found'}</p>
              <p><strong>First Name:</strong> {clerkUser.firstName || 'Not set'}</p>
              <p><strong>Last Name:</strong> {clerkUser.lastName || 'Not set'}</p>
            </div>
          </div>

          {/* Profile Status */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Profile Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Profile Exists:</strong> {profileExists ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Current Profile:</strong> {currentProfile ? '✅ Found' : '❌ Not Found'}</p>
            </div>
          </div>

          {/* Current Profile Details */}
          {currentProfile && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Current Profile Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Database ID:</strong> {currentProfile.id}</p>
                <p><strong>Email:</strong> {currentProfile.email}</p>
                <p><strong>Username:</strong> {currentProfile.username}</p>
                <p><strong>Country:</strong> {currentProfile.country}</p>
                <p><strong>Language:</strong> {currentProfile.preferred_language}</p>
                <p><strong>Verified Seller:</strong> {currentProfile.verified_seller ? 'Yes' : 'No'}</p>
                <p><strong>Bank Verified:</strong> {currentProfile.bank_verified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">What This Means</h2>
            <div className="space-y-2 text-sm">
              <p>• <strong>Email from Clerk:</strong> This is automatically pulled from your Clerk account</p>
              <p>• <strong>Profile Detection:</strong> We use your email to find your profile in our database</p>
              <p>• <strong>No Manual Email Entry:</strong> You never manually enter your email in our forms</p>
              <p>• <strong>Profile Creation:</strong> When you create a profile, we use your Clerk email automatically</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!currentProfile ? (
              <a 
                href="/profile/setup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Profile
              </a>
            ) : (
              <a 
                href="/profile" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Profile
              </a>
            )}
            <a 
              href="/auth-test" 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Auth Test
            </a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
        <pre className="bg-red-50 p-4 rounded-lg overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }
} 