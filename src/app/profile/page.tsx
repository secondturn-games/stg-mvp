import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import ProfileStats from '@/components/profile/ProfileStats'
import ProfileActions from '@/components/profile/ProfileActions'
import { formatCurrency, formatRelativeTime, getUserLocale } from '@/lib/regional-settings'

export default async function ProfilePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError)
  }

  // If no profile exists, redirect to setup
  if (!profile) {
    redirect('/profile/setup')
  }

  // Get user's listings using the actual user ID from the users table
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      games!listings_game_id_fkey (
        title
      )
    `)
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
  }

  // Get user's purchases using the actual user ID from the users table
  const { data: purchases, error: purchasesError } = await supabase
    .from('transactions')
    .select(`
      *,
      listings (
        id,
        description,
        photos,
        games!listings_game_id_fkey (
          title
        )
      )
    `)
    .eq('buyer_id', profile.id)
    .order('created_at', { ascending: false })

  if (purchasesError) {
    console.error('Error fetching purchases:', purchasesError)
  }

  // Format data with regional settings
  const locale = getUserLocale()
  const formattedListings = listings?.map(listing => ({
    ...listing,
    formattedPrice: listing.price ? formatCurrency(listing.price, locale) : 'Trade',
    formattedCreatedAt: formatRelativeTime(listing.created_at, locale),
    gameTitle: listing.games?.title?.en || 'Untitled Game'
  })) || []

  const formattedPurchases = purchases?.map(purchase => ({
    ...purchase,
    formattedAmount: formatCurrency(purchase.amount, locale),
    formattedCreatedAt: formatRelativeTime(purchase.created_at, locale),
    gameTitle: purchase.listings?.games?.title?.en || 'Game'
  })) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.username || 'Anonymous User'}
              </h1>
              <p className="text-gray-600">
                Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
              </p>
              {profile?.location_city && (
                <p className="text-sm text-gray-500">
                  📍 {profile.location_city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <ProfileStats 
          listingsCount={formattedListings.length}
          purchasesCount={formattedPurchases.length}
          totalSpent={formattedPurchases.reduce((sum, p) => sum + p.amount, 0)}
        />

        {/* Actions */}
        <ProfileActions />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Listings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            {formattedListings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't created any listings yet.
              </p>
            ) : (
              <div className="space-y-3">
                {formattedListings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img 
                          src={listing.photos[0]} 
                          alt="Game" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-lg">🎲</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {listing.gameTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {listing.formattedPrice} • {listing.formattedCreatedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
            {formattedPurchases.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't made any purchases yet.
              </p>
            ) : (
              <div className="space-y-3">
                {formattedPurchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {purchase.listings?.photos && purchase.listings.photos.length > 0 ? (
                        <img 
                          src={purchase.listings.photos[0]} 
                          alt="Game" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-lg">🎲</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {purchase.gameTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {purchase.formattedAmount} • {purchase.formattedCreatedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 