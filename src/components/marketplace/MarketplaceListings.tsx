'use client'

import { useRouter } from 'next/navigation'

interface Listing {
  id: string
  listing_type: 'fixed' | 'auction' | 'trade'
  price: number | null
  currency: string
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
  location_city: string
  location_country: string
  created_at: string
  description: Record<string, string>
  photos: string[]
  users: {
    username: string
  }
}

interface MarketplaceListingsProps {
  listings: Listing[]
}

export default function MarketplaceListings({ listings }: MarketplaceListingsProps) {
  const router = useRouter()

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New'
      case 'like_new':
        return 'Like New'
      case 'very_good':
        return 'Very Good'
      case 'good':
        return 'Good'
      case 'acceptable':
        return 'Acceptable'
      default:
        return condition
    }
  }

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'Fixed Price'
      case 'auction':
        return 'Auction'
      case 'trade':
        return 'Trade Only'
      default:
        return type
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return 'Trade'
    return `${currency} ${price.toFixed(2)}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return date.toLocaleDateString()
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Available</h3>
        <p className="text-gray-600">Be the first to create a listing!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <div 
          key={listing.id} 
          className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`/listings/${listing.id}`)}
        >
          {/* Game Image */}
          <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
            {listing.photos && listing.photos.length > 0 ? (
              <img 
                src={listing.photos[0]} 
                alt={listing.description?.en?.split(' - ')[0] || 'Game'}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="text-gray-400 text-center p-4">
                <div className="text-4xl mb-2">🎲</div>
                <div className="text-sm">No Image</div>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {listing.description?.en?.split(' - ')[0] || 'Untitled Game'}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(listing.price, listing.currency)}
              </span>
              <span className="text-xs text-gray-500">
                {getTimeAgo(listing.created_at)}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Condition:</span>
                <span className="font-medium">{getConditionLabel(listing.condition)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="font-medium">{getListingTypeLabel(listing.listing_type)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="font-medium">{listing.location_city}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs text-gray-500">
                    {listing.users.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {listing.users.username || 'Anonymous'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 