"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Clock } from "lucide-react"

interface BidHistoryItem {
  id: number
  bidder: string
  amount: number
  timestamp: string
  isWinning: boolean
  isReservePrice?: boolean
}

interface AuctionBidHistoryProps {
  bids: BidHistoryItem[]
  reservePrice?: number
  reserveMet: boolean
}

export function AuctionBidHistory({ bids, reservePrice, reserveMet }: AuctionBidHistoryProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const maskBidderName = (name: string) => {
    if (name.length <= 2) return name
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Bid History ({bids.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reserve Status */}
        {reservePrice && (
          <div
            className={`p-3 rounded-lg border ${reserveMet ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${reserveMet ? "text-green-600" : "text-orange-600"}`} />
              <span className={`text-sm font-medium ${reserveMet ? "text-green-800" : "text-orange-800"}`}>
                {reserveMet ? "Reserve price has been met" : "Reserve price not yet met"}
              </span>
            </div>
          </div>
        )}

        {/* Bid List */}
        <div className="space-y-2">
          {bids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No bids yet. Be the first to bid!</p>
            </div>
          ) : (
            bids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  bid.isWinning ? "bg-vibrant-orange/10 border-vibrant-orange/30" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{bid.bidder[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{maskBidderName(bid.bidder)}</span>
                      {bid.isWinning && <Badge className="bg-vibrant-orange text-white text-xs">Winning</Badge>}
                      {index === 0 && !bid.isWinning && (
                        <Badge variant="outline" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatTime(bid.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-bold ${bid.isWinning ? "text-vibrant-orange" : "text-gray-700"}`}>
                    €{bid.amount}
                  </div>
                  {bid.isReservePrice && <div className="text-xs text-green-600">Reserve met</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bidding Tips */}
        <div className="p-3 bg-light-beige rounded-lg border-l-4 border-warm-yellow">
          <h4 className="font-medium text-sm mb-1">Bidding Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Bids are binding - only bid what you're willing to pay</li>
            <li>• Consider setting a maximum bid to avoid getting caught up in bidding wars</li>
            <li>• Watch the auction to get notified of new bids</li>
            {reservePrice && !reserveMet && <li>• This auction has a reserve price that hasn't been met yet</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
