import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatRelativeTime, getUserLocale } from '@/lib/regional-settings'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Clock, Gavel } from 'lucide-react'

export default async function MyListingsPage() {
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

  if (!profile) {
    redirect('/profile/setup')
  }

  // Get user's listings (excluding auctions)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      games!listings_game_id_fkey (
        title
      )
    `)
    .eq('seller_id', profile.id)
    .neq('listing_type', 'auction')
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
  }

  // Get user's auctions
  const { data: auctions, error: auctionsError } = await supabase
    .from('auctions')
    .select(`
      *,
      listings!auctions_listing_id_fkey (
        id,
        seller_id,
        game_id,
        listing_type,
        price,
        currency,
        condition,
        location_country,
        location_city,
        shipping_options,
        photos,
        description,
        status,
        verified_photos,
        created_at,
        games!listings_game_id_fkey (
          title
        )
      )
    `)
    .eq('listings.seller_id', profile.id)
    .order('created_at', { ascending: false })

  if (auctionsError) {
    console.error('Error fetching auctions:', auctionsError)
  }

  const locale = getUserLocale()
  
  // Format listings
  const formattedListings = listings?.map(listing => ({
    ...listing,
    type: 'listing' as const,
    formattedPrice: listing.price ? formatCurrency(listing.price, locale) : 'Trade',
    formattedCreatedAt: formatRelativeTime(listing.created_at, locale),
    gameTitle: listing.games?.title?.en || 'Untitled Game'
  })) || []

  // Format auctions
  const formattedAuctions = auctions?.map(auction => ({
    ...auction,
    type: 'auction' as const,
    formattedCurrentPrice: formatCurrency(auction.current_price, locale),
    formattedStartingPrice: formatCurrency(auction.starting_price, locale),
    formattedBuyNowPrice: auction.buy_now_price ? formatCurrency(auction.buy_now_price, locale) : null,
    formattedCreatedAt: formatRelativeTime(auction.created_at, locale),
    gameTitle: auction.listings?.games?.title?.en || 'Untitled Game',
    locationCity: auction.listings?.location_city || 'Unknown',
    photos: auction.listings?.photos || []
  })) || []

  // Combine and sort by creation date
  const allItems = [...formattedListings, ...formattedAuctions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/profile"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          </div>
          <Link
            href="/listings/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {allItems.length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formattedListings.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formattedAuctions.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {allItems.filter(l => l.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {allItems.filter(l => l.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Items</h2>
          </div>
          
          {allItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Yet</h3>
              <p className="text-gray-600 mb-4">Start selling your board games by creating your first listing or auction.</p>
              <Link
                href="/listings/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Item
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {allItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.photos && item.photos.length > 0 ? (
                        <img 
                          src={item.photos[0]} 
                          alt={item.gameTitle}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xl">🎲</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.gameTitle}
                            </h3>
                            {item.type === 'auction' && (
                              <Gavel className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          
                          {item.type === 'listing' ? (
                            <p className="text-sm text-gray-600">
                              {item.formattedPrice} • {item.formattedCreatedAt}
                            </p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                Current: {item.formattedCurrentPrice} • Started: {item.formattedStartingPrice}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>Ends: {new Date(item.end_time).toLocaleDateString(locale)}</span>
                                {item.formattedBuyNowPrice && (
                                  <span>• Buy Now: {item.formattedBuyNowPrice}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'active' ? 'bg-green-100 text-green-800' :
                              item.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.type === 'listing' ? item.location_city : item.locationCity}
                            </span>
                            {item.type === 'auction' && (
                              <span className="text-xs text-red-600">
                                {item.bid_count || 0} bids
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            href={item.type === 'listing' ? `/listings/${item.id}` : `/auctions/${item.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={item.type === 'listing' ? `/listings/${item.id}/edit` : `/auctions/${item.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 