'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Calendar, 
  Package, 
  MessageCircle, 
  Heart,
  Share2,
  ArrowLeft
} from 'lucide-react'

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
  shipping_options: {
    omniva: boolean
    dpd: boolean
    pickup: boolean
  }
  users: {
    id: string
    username: string
    avatar_url: string | null
    email: string
    country: string
  }
}

interface ListingDetailProps {
  listing: Listing
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isContactOpen, setIsContactOpen] = useState(false)

  const gameTitle = listing.description?.en?.split(' - ')[0] || 'Untitled Game'
  const description = listing.description?.en?.split(' - ').slice(1).join(' - ') || ''

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New (Sealed)'
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
    if (price === null) return 'Trade Only'
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

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {listing.photos && listing.photos.length > 0 ? (
              <img
                src={listing.photos[selectedImage]}
                alt={gameTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎲</div>
                  <div className="text-gray-500">No Image</div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {listing.photos && listing.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${gameTitle} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game Information */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{gameTitle}</h1>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(listing.price, listing.currency)}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span>Condition: <span className="font-medium">{getConditionLabel(listing.condition)}</span></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Location: <span className="font-medium">{listing.location_city}</span></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Listed: <span className="font-medium">{getTimeAgo(listing.created_at)}</span></span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span>Type: <span className="font-medium">{getListingTypeLabel(listing.listing_type)}</span></span>
              </div>
              <div className="text-sm text-gray-600">
                <span>ID: <span className="font-mono">{listing.id.slice(0, 8)}...</span></span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
          </div>

          {/* Shipping Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Options</h3>
            <div className="space-y-2">
              {listing.shipping_options.omniva && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Omniva Parcel Machine</span>
                </div>
              )}
              {listing.shipping_options.dpd && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>DPD Pickup Point</span>
                </div>
              )}
              {listing.shipping_options.pickup && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Local Pickup</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {listing.users.avatar_url ? (
                  <img 
                    src={listing.users.avatar_url} 
                    alt={listing.users.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <span className="text-lg font-medium text-gray-600">
                    {listing.users.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
                             <div>
                 <div className="font-medium text-gray-900">{listing.users.username}</div>
                 <div className="text-sm text-gray-600">{listing.users.country}</div>
               </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="space-y-3">
            <button
              onClick={() => setIsContactOpen(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Seller
            </button>
            
            {listing.listing_type === 'auction' && (
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Place Bid
              </button>
            )}
            
            {listing.listing_type === 'fixed' && listing.price && (
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal (placeholder) */}
      {isContactOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
            <p className="text-gray-600 mb-4">
              Contact feature coming soon! For now, you can reach out to the seller through their profile.
            </p>
            <button
              onClick={() => setIsContactOpen(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 