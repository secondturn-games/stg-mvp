"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Gavel, Clock, Eye, Heart, TrendingUp, AlertCircle } from "lucide-react"
import Image from "next/image"

interface AuctionListing {
  id: number
  title: string
  condition: string
  location: string
  seller: {
    name: string
    avatar: string
    rating: number
    reviewCount: number
  }
  images: string[]
  description: string
  currentBid: number
  startingBid: number
  reservePrice?: number
  buyNowPrice?: number
  reserveMet: boolean
  bidCount: number
  watchers: number
  endTime: string
  hasReserve: boolean
  allowBuyNow: boolean
}

interface AuctionCardProps {
  listing: AuctionListing
  onViewAuction: (listingId: number) => void
  compact?: boolean
}

export function AuctionCard({ listing, onViewAuction, compact = false }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [showBidInput, setShowBidInput] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const endTime = new Date(listing.endTime).getTime()
      const difference = endTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      } else {
        setTimeLeft("Ended")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [listing.endTime])

  const getMinimumBid = () => {
    return listing.currentBid > listing.startingBid ? listing.currentBid + 1 : listing.startingBid
  }

  const isAuctionActive = timeLeft !== "Ended"
  const isEndingSoon = timeLeft.includes("m") && !timeLeft.includes("h") && !timeLeft.includes("d")

  const handlePlaceBid = () => {
    // In production, this would make an API call
    console.log(`Placing bid of €${bidAmount} on auction ${listing.id}`)
    setShowBidInput(false)
    setBidAmount("")
  }

  const handleBuyNow = () => {
    // In production, this would make an API call
    console.log(`Buying now for €${listing.buyNowPrice} on auction ${listing.id}`)
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Image
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                width={60}
                height={60}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{listing.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <Badge className="bg-purple-100 text-purple-800 text-xs">Auction</Badge>
                <span>{listing.bidCount} bids</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-vibrant-orange">€{listing.currentBid}</div>
                  <div className="text-xs text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeLeft}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onViewAuction(listing.id)}
                  className="bg-dark-green hover:bg-dark-green/90"
                >
                  <Gavel className="w-3 h-3 mr-1" />
                  Bid
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Image
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-purple-600 text-white">
                <Gavel className="w-3 h-3 mr-1" />
                Auction
              </Badge>
              {isEndingSoon && (
                <Badge className="absolute top-2 right-2 bg-red-600 text-white animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Ending Soon
                </Badge>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-100 text-blue-800">{listing.condition}</Badge>
                  <span className="text-sm text-gray-600">{listing.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWatching(!isWatching)}
                  className={isWatching ? "text-red-500" : "text-gray-400"}
                >
                  <Heart className={`w-4 h-4 ${isWatching ? "fill-current" : ""}`} />
                </Button>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {listing.watchers}
                </div>
              </div>
            </div>

            {/* Auction Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-vibrant-orange">€{listing.currentBid}</div>
                <div className="text-xs text-gray-600">Current Bid</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">{listing.bidCount}</div>
                <div className="text-xs text-gray-600">Bids</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${isEndingSoon ? "text-red-600" : "text-gray-700"}`}>{timeLeft}</div>
                <div className="text-xs text-gray-600">Time Left</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">{listing.watchers}</div>
                <div className="text-xs text-gray-600">Watching</div>
              </div>
            </div>

            {/* Reserve Status */}
            {listing.hasReserve && (
              <div className="flex items-center gap-2 text-sm">
                {listing.reserveMet ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    Reserve met
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    Reserve not met
                  </div>
                )}
              </div>
            )}

            {/* Seller Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={listing.seller.avatar || "/placeholder.svg"} />
                <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{listing.seller.name}</div>
                <div className="text-sm text-gray-600">
                  ⭐ {listing.seller.rating} ({listing.seller.reviewCount} reviews)
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm line-clamp-2">{listing.description}</p>

            {/* Action Buttons */}
            {isAuctionActive && (
              <div className="flex flex-col sm:flex-row gap-3">
                {!showBidInput ? (
                  <Button
                    onClick={() => setShowBidInput(true)}
                    className="flex-1 bg-vibrant-orange hover:bg-vibrant-orange/90"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Place Bid (min €{getMinimumBid()})
                  </Button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Min €${getMinimumBid()}`}
                      min={getMinimumBid()}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handlePlaceBid}
                      disabled={!bidAmount || Number(bidAmount) < getMinimumBid()}
                      className="bg-vibrant-orange hover:bg-vibrant-orange/90"
                    >
                      Bid
                    </Button>
                    <Button variant="outline" onClick={() => setShowBidInput(false)} className="bg-transparent">
                      Cancel
                    </Button>
                  </div>
                )}

                {listing.allowBuyNow && listing.buyNowPrice && (
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1 bg-dark-green text-white hover:bg-dark-green/90"
                  >
                    Buy Now €{listing.buyNowPrice}
                  </Button>
                )}
              </div>
            )}

            {!isAuctionActive && (
              <div className="text-center py-4 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>This auction has ended</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
