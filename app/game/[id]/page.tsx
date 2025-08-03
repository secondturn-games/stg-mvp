"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Clock,
  Dice1,
  Dice6,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Import the price comparison component at the top
import { PriceComparison } from "@/components/price-comparison"
import { Navigation } from "@/components/navigation"

// Mock game data - would come from API
const gameData = {
  id: 1,
  title: "Wingspan",
  price: 35,
  originalPrice: 65,
  condition: "Like New",
  location: "Tallinn, Estonia",
  seller: {
    name: "Kristjan M.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4.9,
    reviewCount: 23,
    memberSince: "Jan 2023",
    responseTime: "Usually responds within 2 hours",
  },
  images: [
    "/placeholder.svg?height=400&width=400&text=Wingspan+Main",
    "/placeholder.svg?height=400&width=400&text=Wingspan+Box",
    "/placeholder.svg?height=400&width=400&text=Wingspan+Components",
    "/placeholder.svg?height=400&width=400&text=Wingspan+Cards",
  ],
  description:
    "Beautiful engine-building game about birds. Played only twice, all components included. The box has minor shelf wear but all cards and components are in perfect condition. Includes the original insert and all wooden pieces are pristine.",
  bgg: {
    rating: 8.1,
    year: 2019,
    minPlayers: 1,
    maxPlayers: 5,
    playTime: "40-70 min",
    minAge: 10,
    mechanics: ["Engine Building", "Card Drafting", "Tableau Building"],
    categories: ["Animals", "Strategy"],
  },
  included: ["Original box", "All game pieces", "Instruction manual", "Insert/organizer"],
  tradingOptions: ["Local pickup", "Shipping within Estonia", "Meet at public location"],
  postedDate: "2 days ago",
  views: 45,
  favorites: 8,
}

const comments = [
  {
    id: 1,
    user: "Līga R.",
    avatar: "/placeholder.svg?height=32&width=32",
    comment: "Are all the bird cards included? Any missing pieces?",
    timestamp: "1 day ago",
    replies: [
      {
        id: 2,
        user: "Kristjan M.",
        avatar: "/placeholder.svg?height=32&width=32",
        comment: "Yes, all 170 bird cards are included and in perfect condition. No missing pieces at all!",
        timestamp: "1 day ago",
        isSeller: true,
      },
    ],
  },
  {
    id: 3,
    user: "Tomas K.",
    avatar: "/placeholder.svg?height=32&width=32",
    comment: "Would you consider shipping to Lithuania?",
    timestamp: "6 hours ago",
    replies: [],
  },
]

export default function GameDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [showContactModal, setShowContactModal] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gameData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gameData.images.length) % gameData.images.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

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
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <Image
                    src={gameData.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${gameData.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />

                  {gameData.images.length > 1 && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {gameData.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {gameData.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {gameData.images.map((image, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                          index === currentImageIndex ? "border-vibrant-orange" : "border-gray-200"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{gameData.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {gameData.postedDate}
                      </span>
                      <span>{gameData.views} views</span>
                      <span>{gameData.favorites} favorites</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price and Condition */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-vibrant-orange">€{gameData.price}</span>
                    <span className="text-lg text-gray-500 line-through">€{gameData.originalPrice}</span>
                    <Badge className="bg-green-100 text-green-800">{gameData.condition}</Badge>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {gameData.location}
                  </div>
                </div>

                {/* BGG Info */}
                <div className="bg-light-beige rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <span className="bg-dark-green text-white px-2 py-1 rounded text-sm mr-2">BGG</span>
                    BoardGameGeek Info
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-medium">{gameData.bgg.rating}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Year:</span>
                        <span>{gameData.bgg.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span>
                          {gameData.bgg.minPlayers}-{gameData.bgg.maxPlayers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Play Time:</span>
                        <span>{gameData.bgg.playTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600">Mechanics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gameData.bgg.mechanics.map((mechanic) => (
                            <Badge key={mechanic} variant="secondary" className="text-xs">
                              {mechanic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gameData.bgg.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{gameData.description}</p>
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {gameData.included.map((item) => (
                      <div key={item} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trading Options */}
                <div>
                  <h3 className="font-semibold mb-2">Trading Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameData.tradingOptions.map((option) => (
                      <Badge key={option} variant="outline" className="bg-transparent">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Questions & Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment Form */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ask a question about this game..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border-warm-yellow focus:border-vibrant-orange"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Comments are public and help other buyers</span>
                    <Button
                      size="sm"
                      className="bg-vibrant-orange hover:bg-vibrant-orange/90"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="ml-11 flex items-start space-x-3">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={reply.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{reply.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{reply.user}</span>
                              {reply.isSeller && <Badge className="bg-vibrant-orange text-white text-xs">Seller</Badge>}
                              <span className="text-xs text-gray-500">{reply.timestamp}</span>
                            </div>
                            <p className="text-gray-700">{reply.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={gameData.seller.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{gameData.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{gameData.seller.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-warm-yellow text-warm-yellow mr-1" />
                      {gameData.seller.rating} ({gameData.seller.reviewCount} reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div>Member since {gameData.seller.memberSince}</div>
                  <div>{gameData.seller.responseTime}</div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/profile/${gameData.seller.name.replace(" ", "-").toLowerCase()}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison */}
            <PriceComparison gameName={gameData.title} userPrice={gameData.price} compact={false} />

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-600">
                <div>• Meet in public places for local trades</div>
                <div>• Check seller ratings and reviews</div>
                <div>• Use secure payment methods</div>
                <div>• Report suspicious activity</div>
                <Link href="/safety" className="text-vibrant-orange hover:text-vibrant-orange/80 text-xs">
                  Read full safety guide →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal - Simple placeholder */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Contact {gameData.seller.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Start a conversation about "{gameData.title}"</p>
              <Textarea
                placeholder="Hi! I'm interested in your game..."
                className="border-warm-yellow focus:border-vibrant-orange"
              />
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-vibrant-orange hover:bg-vibrant-orange/90">Send Message</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
