'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import OptimizedImage from '@/components/ui/OptimizedImage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/ToastProvider'
import { formatCurrency, formatRelativeTime, formatAuctionTimeLeft, getUserLocale } from '@/lib/regional-settings'

interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  is_proxy: boolean
  created_at: string
  users: {
    username: string
  }
}

interface Auction {
  id: string
  listing_id: string
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

interface AuctionDetailProps {
  auction: Auction
  bids: Bid[]
}

export default function AuctionDetail({ auction, bids: initialBids }: AuctionDetailProps) {
  const { userId } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const locale = getUserLocale()
  
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [bidAmount, setBidAmount] = useState('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isAuctionActive, setIsAuctionActive] = useState(auction.status === 'active')

  // Calculate time left
  useEffect(() => {
    const updateTimeLeft = () => {
      if (!isAuctionActive) {
        setTimeLeft('Auction ended')
        return
      }

      setTimeLeft(formatAuctionTimeLeft(auction.end_time))
      
      const now = new Date().getTime()
      const endTime = new Date(auction.end_time).getTime()
      if (endTime <= now) {
        setIsAuctionActive(false)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [auction.end_time, isAuctionActive])

  // Real-time updates for bids
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${auction.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bids',
          filter: `auction_id=eq.${auction.id}`
        }, 
        (payload) => {
          const newBid = payload.new as Bid
          setBids(prev => [newBid, ...prev])
          
          // Update current price
          if (newBid.amount > auction.current_price) {
            // This would need to be handled by the backend trigger
            // For now, we'll just show a toast
            showToast('New bid placed!', 'info')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auction.id, auction.current_price, showToast])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      showToast('Please sign in to place a bid', 'error')
      return
    }

    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= auction.current_price) {
      showToast('Bid must be higher than current price', 'error')
      return
    }

    setIsPlacingBid(true)

    try {
      const response = await fetch('/api/auctions/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auction.id,
          amount: amount
        }),
      })

      if (response.ok) {
        showToast('Bid placed successfully!', 'success')
        setBidAmount('')
        // The real-time subscription will update the bids
      } else {
        const error = await response.json()
        showToast(error.message || 'Failed to place bid', 'error')
      }
    } catch (error) {
      showToast('An error occurred while placing your bid', 'error')
    } finally {
      setIsPlacingBid(false)
    }
  }

  const handleBuyNow = async () => {
    if (!userId) {
      showToast('Please sign in to buy now', 'error')
      return
    }

    if (!auction.buy_now_price) {
      showToast('Buy now price not available', 'error')
      return
    }

    try {
      const response = await fetch('/api/auctions/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auction.id
        }),
      })

      if (response.ok) {
        showToast('Purchase successful!', 'success')
        router.push('/profile/my-purchases')
      } else {
        const error = await response.json()
        showToast(error.message || 'Failed to purchase', 'error')
      }
    } catch (error) {
      showToast('An error occurred during purchase', 'error')
    }
  }

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

  const getTimeAgo = (dateString: string) => {
    return formatRelativeTime(dateString, locale)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Game Info */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {auction.listings.games?.title?.en || 'Untitled Game'}
          </h1>
          
          {/* Game Image */}
          <div className="mb-6">
            {auction.listings.photos && auction.listings.photos.length > 0 ? (
              <OptimizedImage
                src={auction.listings.photos[0]}
                alt={auction.listings.games?.title?.en || 'Game'}
                className="w-full h-64 object-cover rounded-lg"
                fallback="🎲"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🎲</div>
                  <div className="text-gray-500">No Image</div>
                </div>
              </div>
            )}
          </div>

          {/* Game Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Condition</span>
              <p className="font-medium">{getConditionLabel(auction.listings.condition)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-medium">{auction.listings.location_city}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">
              {auction.listings.description?.en || 'No description available'}
            </p>
          </div>

          {/* Seller Info */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Seller</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium">
                  {auction.listings.users.username?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <p className="font-medium">{auction.listings.users.username || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">Member since {new Date(auction.created_at).getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auction Info */}
      <div className="space-y-6">
        {/* Auction Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPrice(auction.current_price)}
            </div>
            <div className="text-sm text-gray-500">
              {bids.length} bid{bids.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Time Left */}
          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-gray-900">
              {isAuctionActive ? 'Time Left' : 'Auction Ended'}
            </div>
            <div className={`text-2xl font-bold ${isAuctionActive ? 'text-red-600' : 'text-gray-500'}`}>
              {timeLeft}
            </div>
          </div>

          {/* Bid Form */}
          {isAuctionActive && (
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid (EUR)
                </label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={auction.current_price + auction.bid_increment}
                  step="0.01"
                  required
                  placeholder={`Min: €${(auction.current_price + auction.bid_increment).toFixed(2)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={isPlacingBid}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPlacingBid ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Placing Bid...
                  </div>
                ) : (
                  'Place Bid'
                )}
              </button>
            </form>
          )}

          {/* Buy Now Button */}
          {isAuctionActive && auction.buy_now_price && (
            <div className="mt-4">
              <button
                onClick={handleBuyNow}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Buy Now for {formatPrice(auction.buy_now_price)}
              </button>
            </div>
          )}

          {/* Auction Info */}
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Starting Price:</span>
              <span>{formatPrice(auction.starting_price)}</span>
            </div>
            {auction.reserve_price && (
              <div className="flex justify-between">
                <span>Reserve Price:</span>
                <span>{formatPrice(auction.reserve_price)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Bid Increment:</span>
              <span>{formatPrice(auction.bid_increment)}</span>
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Bid History</h3>
          {bids.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bids yet</p>
          ) : (
            <div className="space-y-3">
              {bids.slice(0, 10).map((bid) => (
                <div key={bid.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium">{bid.users.username}</div>
                    <div className="text-sm text-gray-500">{getTimeAgo(bid.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(bid.amount)}</div>
                    {bid.is_proxy && (
                      <div className="text-xs text-gray-500">Proxy</div>
                    )}
                  </div>
                </div>
              ))}
              {bids.length > 10 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  +{bids.length - 10} more bids
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 