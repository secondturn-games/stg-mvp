import React from 'react'

interface UserProfileProps {
  user?: {
    id: string
    email: string
    username: string
    verifiedSeller: boolean
    preferredLanguage: 'en' | 'et' | 'lv' | 'lt'
    country: 'EE' | 'LV' | 'LT'
  } | null
}

export function UserProfile({ user }: UserProfileProps) {
  if (!user) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-forestDeep mb-4">
          Sign In Required
        </h3>
        <p className="text-forestDeep/70 mb-4">
          Please sign in to view your profile and manage your listings.
        </p>
        <button className="btn-primary">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-forestDeep">
          Profile
        </h3>
        {user.verifiedSeller && (
          <span className="bg-goldenBeam text-forestDeep px-3 py-1 rounded-full text-sm font-medium">
            Verified Seller
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-forestDeep/70 mb-1">
            Username
          </label>
          <p className="text-forestDeep font-medium">{user.username}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-forestDeep/70 mb-1">
            Email
          </label>
          <p className="text-forestDeep font-medium">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-forestDeep/70 mb-1">
            Country
          </label>
          <p className="text-forestDeep font-medium">
            {user.country === 'EE' && 'Estonia'}
            {user.country === 'LV' && 'Latvia'}
            {user.country === 'LT' && 'Lithuania'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-forestDeep/70 mb-1">
            Preferred Language
          </label>
          <p className="text-forestDeep font-medium">
            {user.preferredLanguage === 'en' && 'English'}
            {user.preferredLanguage === 'et' && 'Eesti'}
            {user.preferredLanguage === 'lv' && 'Latviešu'}
            {user.preferredLanguage === 'lt' && 'Lietuvių'}
          </p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <button className="btn-secondary w-full">
          Edit Profile
        </button>
      </div>
    </div>
  )
} 