"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { History, MapPin, TrendingUp } from "lucide-react"

interface HistoricalListing {
  id: number
  price: number
  condition: string
  seller: string
  location: string
  soldDate: string
  daysSinceSold: number
}

interface HistoricalListingsProps {
  listings: HistoricalListing[]
  gameTitle: string
}

export function HistoricalListings({ listings, gameTitle }: HistoricalListingsProps) {
  const averageHistoricalPrice = Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)

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

  const formatSoldDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Sales History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-dark-green">€{averageHistoricalPrice}</div>
            <div className="text-sm text-gray-600">Avg. Sale Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
            <div className="text-sm text-gray-600">Recent Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              €{Math.min(...listings.map((l) => l.price))} - €{Math.max(...listings.map((l) => l.price))}
            </div>
            <div className="text-sm text-gray-600">Price Range</div>
          </div>
        </div>

        {/* Historical Listings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Past Listings</h4>
          <div className="space-y-2">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{listing.seller[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">€{listing.price}</span>
                      <Badge className={getConditionColor(listing.condition)}>{listing.condition}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{listing.seller}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">Sold {formatSoldDate(listing.soldDate)}</div>
                  <div className="text-xs text-gray-500">{listing.daysSinceSold} days ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insight */}
        <div className="p-4 bg-light-beige rounded-lg border-l-4 border-warm-yellow">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-warm-yellow mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Market Insight</h4>
              <p className="text-sm text-gray-600 mt-1">
                Based on recent sales, {gameTitle} typically sells for €{averageHistoricalPrice} in the Baltic region.
                {listings.length >= 3 && (
                  <>
                    {" "}
                    Prices have been{" "}
                    {listings[0].price > listings[listings.length - 1].price ? "increasing" : "decreasing"} recently.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">Historical data shows listings from the past 3 months</div>
      </CardContent>
    </Card>
  )
}
