"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Heart, MessageCircle, Eye, Clock, Truck, Package, Plus } from "lucide-react"
import Image from "next/image"

interface Seller {
  name: string
  avatar: string
  rating: number
  reviewCount: number
  responseTime: string
}

interface Listing {
  id: number
  price: number
  originalPrice: number
  condition: string
  location: string
  distance: string
  seller: Seller
  images: string[]
  description: string
  tradingOptions: string[]
  postedDate: string
  views: number
  favorites: number
  included: string[]
  expansions: string[]
}

interface GameListingsComparisonProps {
  listings: Listing[]
  onViewListing: (listingId: number) => void
}

export function GameListingsComparison({ listings, onViewListing }: GameListingsComparisonProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState<"price" | "distance" | "condition" | "rating">("price")

  const toggleFavorite = (listingId: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId)
    } else {
      newFavorites.add(listingId)
    }
    setFavorites(newFavorites)
  }

  const getConditionScore = (condition: string) => {
    const scores = { New: 5, "Like New": 4, "Very Good": 3, Good: 2, Fair: 1 }
    return scores[condition as keyof typeof scores] || 0
  }

  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price
      case "distance":
        return Number.parseInt(a.distance) - Number.parseInt(b.distance)
      case "condition":
        return getConditionScore(b.condition) - getConditionScore(a.condition)
      case "rating":
        return b.seller.rating - a.seller.rating
      default:
        return 0
    }
  })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New":
        return "bg-green-100 text-green-800"
      case "Like New":
        return "bg-blue-100 text-blue-800"
      case "Very Good":
        return "bg-purple-100 text-purple-800"
      case "Good":
        return "bg-yellow-100 text-yellow-800"
      case "Fair":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSavingsPercentage = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-gray-600 mr-2">Sort by:</span>
        {[
          { key: "price", label: "Price" },
          { key: "distance", label: "Distance" },
          { key: "condition", label: "Condition" },
          { key: "rating", label: "Seller Rating" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={sortBy === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy(key as any)}
            className={sortBy === key ? "bg-vibrant-orange hover:bg-vibrant-orange/90" : "bg-transparent"}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6">
        {sortedListings.map((listing, index) => (
          <Card
            key={listing.id}
            className={`hover:shadow-lg transition-shadow ${index === 0 ? "ring-2 ring-vibrant-orange" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Image
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={`Listing ${listing.id}`}
                      width={150}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    {index === 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-vibrant-orange text-white">Best Deal</Badge>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-vibrant-orange">€{listing.price}</span>
                        <span className="text-lg text-gray-500 line-through">€{listing.originalPrice}</span>
                        <Badge className={getConditionColor(listing.condition)}>{listing.condition}</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {getSavingsPercentage(listing.price, listing.originalPrice)}% off
                        </Badge>
                      </div>

                      {listing.expansions.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Plus className="w-4 h-4 text-vibrant-orange" />
                          <span className="text-sm font-medium text-vibrant-orange">
                            Includes: {listing.expansions.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(listing.id)}
                        className={favorites.has(listing.id) ? "text-red-500" : "text-gray-400"}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(listing.id) ? "fill-current" : ""}`} />
                      </Button>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {listing.views}
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={listing.seller.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{listing.seller.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-warm-yellow text-warm-yellow" />
                          {listing.seller.rating} ({listing.seller.reviewCount})<span className="text-gray-400">•</span>
                          <Clock className="w-4 h-4" />
                          {listing.seller.responseTime}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {listing.location}
                      </div>
                      <div className="text-xs text-gray-500">{listing.distance} away</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm line-clamp-2">{listing.description}</p>

                  {/* What's Included & Trading Options */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">What's Included:</h4>
                      <div className="flex flex-wrap gap-1">
                        {listing.included.slice(0, 3).map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {listing.included.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{listing.included.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Trading Options:</h4>
                      <div className="flex flex-wrap gap-1">
                        {listing.tradingOptions.map((option) => (
                          <Badge key={option} variant="outline" className="text-xs bg-transparent">
                            {option.includes("pickup") && <Package className="w-3 h-3 mr-1" />}
                            {option.includes("Shipping") && <Truck className="w-3 h-3 mr-1" />}
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={() => onViewListing(listing.id)}
                      className="flex-1 bg-vibrant-orange hover:bg-vibrant-orange/90"
                    >
                      View Details
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                  </div>

                  {/* Posted Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Posted {listing.postedDate} • {listing.favorites} people favorited this
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-light-beige border-warm-yellow">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-vibrant-orange">€{Math.min(...listings.map((l) => l.price))}</div>
              <div className="text-sm text-gray-600">Lowest Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-dark-green">
                €{Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)}
              </div>
              <div className="text-sm text-gray-600">Average Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {listings.filter((l) => l.condition === "New" || l.condition === "Like New").length}
              </div>
              <div className="text-sm text-gray-600">Like New+</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {listings.filter((l) => l.tradingOptions.some((opt) => opt.includes("pickup"))).length}
              </div>
              <div className="text-sm text-gray-600">Local Pickup</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
