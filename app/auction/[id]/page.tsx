"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gavel, Clock, Heart, MapPin, Star, AlertCircle, TrendingUp, Dice1, Dice6 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuctionBidHistory } from "@/components/auction-bid-history"


// Mock auction data
const mockAuction = {
  id: 1,
  title: "Wingspan - European Expansion Included",
  condition: "Like New",
  location: "Tallinn, Estonia",
  seller: {
    name: "Kristjan M.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4.9,
    reviewCount: 23,
    responseTime: "2 hours",
  },
  images: [
    "/placeholder.svg?height=400&width=400&text=Wingspan+Main",
    "/placeholder.svg?height=400&width=400&text=Wingspan+Box",
    "/placeholder.svg?height=400&width=400&text=Wingspan+Components",
  ],
  description:
    "Beautiful condition Wingspan with European Expansion. Played only a few times, all components present and accounted for. Cards are in perfect condition, no wear on the box corners.",
  startingBid: 25,
  currentBid: 42,
  reservePrice: 35,
  buyNowPrice: 65,
  reserveMet: true,
  bidCount: 8,
  watchers: 15,
  endTime: "2024-02-01T18:00:00Z",
  hasReserve: true,
  allowBuyNow: true,
  bggId: 266192,
  year: 2019,
  minPlayers: 1,
  maxPlayers: 5,
  playTime: "40-70 min",
  mechanics: ["Engine Building", "Card Drafting", "Tableau Building"],
  included: ["Original box", "All game pieces", "Instruction manual", "European Expansion"],
}

const mockBidHistory = [
  { id: 8, bidder: "Anna_K", amount: 42, timestamp: "2024-01-25T14:30:00Z", isWinning: true },
  { id: 7, bidder: "BoardGamer2024", amount: 40, timestamp: "2024-01-25T14:15:00Z", isWinning: false },
  { id: 6, bidder: "GameCollector", amount: 38, timestamp: "2024-01-25T13:45:00Z", isWinning: false },
  { id: 5, bidder: "Anna_K", amount: 36, timestamp: "2024-01-25T12:20:00Z", isWinning: false, isReservePrice: true },
  { id: 4, bidder: "TabletopFan", amount: 33, timestamp: "2024-01-25T11:10:00Z", isWinning: false },
  { id: 3, bidder: "BoardGamer2024", amount: 30, timestamp: "2024-01-25T10:30:00Z", isWinning: false },
  { id: 2, bidder: "GameCollector", amount: 28, timestamp: "2024-01-25T09:15:00Z", isWinning: false },
  { id: 1, bidder: "Anna_K", amount: 25, timestamp: "2024-01-25T08:00:00Z", isWinning: false },
]

export default function AuctionPage() {
  const params = useParams()
  const auctionId = params.id as string

  const [timeLeft, setTimeLeft] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const endTime = new Date(mockAuction.endTime).getTime()
      const difference = endTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`)
        }
      } else {
        setTimeLeft("Ended")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const getMinimumBid = () => {
    return mockAuction.currentBid + 1
  }

  const isAuctionActive = timeLeft !== "Ended"
  const isEndingSoon = timeLeft.includes("m") && !timeLeft.includes("h") && !timeLeft.includes("d")

  const handlePlaceBid = () => {
    console.log(`Placing bid of €${bidAmount}`)
    setBidAmount("")
  }

  const handleBuyNow = () => {
    console.log(`Buying now for €${mockAuction.buyNowPrice}`)
  }

  const handleToggleWatch = () => {
    setIsWatching(!isWatching)
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/games" className="text-vibrant-orange hover:text-vibrant-orange/80">
            ← Back to Games
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600 text-white">
                        <Gavel className="w-3 h-3 mr-1" />
                        Auction
                      </Badge>
                      {isEndingSoon && (
                        <Badge className="bg-red-600 text-white animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Ending Soon
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{mockAuction.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge className="bg-blue-100 text-blue-800">{mockAuction.condition}</Badge>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {mockAuction.location}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleWatch}
                    className={isWatching ? "text-red-500" : "text-gray-400"}
                  >
                    <Heart className={`w-5 h-5 ${isWatching ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {/* Images */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Image
                      src={mockAuction.images[selectedImage] || "/placeholder.svg"}
                      alt={mockAuction.title}
                      width={400}
                      height={400}
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {mockAuction.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`border-2 rounded-lg overflow-hidden ${
                          selectedImage === index ? "border-vibrant-orange" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${mockAuction.title} ${index + 1}`}
                          width={120}
                          height={120}
                          className="w-full aspect-square object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{mockAuction.description}</p>
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockAuction.included.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Game Details</TabsTrigger>
                <TabsTrigger value="bids">Bid History ({mockBidHistory.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Players:</span>
                        <span className="ml-2 font-medium">
                          {mockAuction.minPlayers}-{mockAuction.maxPlayers}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Play Time:</span>
                        <span className="ml-2 font-medium">{mockAuction.playTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Year:</span>
                        <span className="ml-2 font-medium">{mockAuction.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">BGG ID:</span>
                        <span className="ml-2 font-medium">{mockAuction.bggId}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-sm">Mechanics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mockAuction.mechanics.map((mechanic) => (
                          <Badge key={mechanic} variant="outline" className="text-xs">
                            {mechanic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bids">
                <AuctionBidHistory
                  bids={mockBidHistory}
                  reservePrice={mockAuction.reservePrice}
                  reserveMet={mockAuction.reserveMet}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Auction Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Auction Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Bid */}
                <div className="text-center p-4 bg-vibrant-orange/10 rounded-lg">
                  <div className="text-3xl font-bold text-vibrant-orange">€{mockAuction.currentBid}</div>
                  <div className="text-sm text-gray-600">Current Bid</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{mockAuction.bidCount}</div>
                    <div className="text-xs text-gray-600">Bids</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${isEndingSoon ? "text-red-600" : ""}`}>{timeLeft}</div>
                    <div className="text-xs text-gray-600">Time Left</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{mockAuction.watchers}</div>
                    <div className="text-xs text-gray-600">Watching</div>
                  </div>
                </div>

                {/* Reserve Status */}
                {mockAuction.hasReserve && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      mockAuction.reserveMet
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-orange-50 text-orange-800 border border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {mockAuction.reserveMet ? "Reserve price met" : "Reserve price not met"}
                    </div>
                  </div>
                )}

                {/* Bidding */}
                {isAuctionActive && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="bid-amount">Your Bid (€)</Label>
                      <Input
                        id="bid-amount"
                        type="number"
                        placeholder={`Min €${getMinimumBid()}`}
                        min={getMinimumBid()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handlePlaceBid}
                      disabled={!bidAmount || Number(bidAmount) < getMinimumBid()}
                      className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Place Bid
                    </Button>

                    {mockAuction.allowBuyNow && (
                      <Button
                        onClick={handleBuyNow}
                        variant="outline"
                        className="w-full bg-dark-green text-white hover:bg-dark-green/90"
                      >
                        Buy Now €{mockAuction.buyNowPrice}
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
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-600">{mockAuction.seller.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium">{mockAuction.seller.name}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {mockAuction.seller.rating} ({mockAuction.seller.reviewCount} reviews)
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div>Response time: {mockAuction.seller.responseTime}</div>
                  <div>Location: {mockAuction.location}</div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  View Seller Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
