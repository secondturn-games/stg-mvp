'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { formatCurrency, formatAuctionTimeLeft, getUserLocale } from '@/lib/regional-settings'

interface Auction {
  id: string
  starting_price: number
  current_price: number
  reserve_price: number | null
  bid_increment: number
  end_time: string
  extension_time: number
  buy_now_price: number | null
  status: 'active' | 'ended' | 'cancelled' | 'reserved'
  winner_id: string | null
  minimum_bid: number
  created_at: string
  updated_at: string
  listings: {
    id: string
    seller_id: string
    game_id: string
    listing_type: string
    price: number | null
    currency: string
    condition: string
    location_country: string
    location_city: string
    shipping_options: Record<string, any>
    photos: string[]
    description: Record<string, string>
    status: string
    verified_photos: boolean
    created_at: string
    users: {
      username: string
    }
    games: {
      title: Record<string, string>
    }
  }
}

interface AuctionCardProps {
  auction: Auction
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState('')
  const locale = getUserLocale()

  // Calculate time left
  useEffect(() => {
    const updateTimeLeft = () => {
      setTimeLeft(formatAuctionTimeLeft(auction.end_time))
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [auction.end_time])

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new': return 'New'
      case 'like_new': return 'Like New'
      case 'very_good': return 'Very Good'
      case 'good': return 'Good'
      case 'acceptable': return 'Acceptable'
      default: return condition
    }
  }

  const formatPrice = (price: number) => {
    return formatCurrency(price, locale)
  }

  const isEndingSoon = () => {
    const now = new Date().getTime()
    const endTime = new Date(auction.end_time).getTime()
    const timeRemaining = endTime - now
    return timeRemaining <= 30 * 60 * 1000 // 30 minutes
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer group relative"
      onClick={() => router.push(`/auctions/${auction.id}`)}
    >
      {/* Game Image */}
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        {auction.listings.photos && auction.listings.photos.length > 0 ? (
          <OptimizedImage 
            src={auction.listings.photos[0]} 
            alt={auction.listings.games?.title?.en || 'Game'}
            className="w-full h-full rounded-t-lg"
            fallback="🎲"
          />
        ) : (
          <div className="text-gray-400 text-center p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">🎲</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Auction Badge */}
      <div className="absolute top-2 left-2">
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          AUCTION
        </span>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {auction.listings.games?.title?.en || 'Untitled Game'}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(auction.current_price)}
          </span>
          <span className={`text-xs font-medium ${isEndingSoon() ? 'text-red-600' : 'text-gray-500'}`}>
            {timeLeft}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Condition:</span>
            <span className="font-medium">{getConditionLabel(auction.listings.condition)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Location:</span>
            <span className="font-medium">{auction.listings.location_city}</span>
          </div>

          {auction.buy_now_price && (
            <div className="flex items-center justify-between">
              <span>Buy Now:</span>
              <span className="font-medium text-green-600">{formatPrice(auction.buy_now_price)}</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs text-gray-500">
                  {auction.listings.users.username?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {auction.listings.users.username || 'Anonymous'}
              </span>
            </div>
            <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              View Auction →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 