"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface GameInfo {
  title: string
  mechanics: string[]
  categories: string[]
}

interface SimilarGame {
  slug: string
  title: string
  year: number
  image: string
  rating: number
  minPlayers: number
  maxPlayers: number
  playTime: string
  mechanics: string[]
  categories: string[]
  currentListings: number
  priceRange?: { min: number; max: number }
  matchScore: number
  matchReasons: string[]
}

interface SimilarGamesProps {
  currentGame: GameInfo
  mechanics: string[]
  categories: string[]
}

// Mock similar games data - in production this would be calculated based on BGG data
const mockSimilarGames: SimilarGame[] = [
  {
    slug: "everdell",
    title: "Everdell",
    year: 2018,
    image: "/placeholder.svg?height=150&width=150&text=Everdell",
    rating: 8.0,
    minPlayers: 1,
    maxPlayers: 4,
    playTime: "40-80 min",
    mechanics: ["Worker Placement", "Tableau Building", "Hand Management"],
    categories: ["Animals", "Fantasy", "Strategy"],
    currentListings: 3,
    priceRange: { min: 42, max: 58 },
    matchScore: 85,
    matchReasons: ["Tableau Building", "Animals theme", "Similar complexity"],
  },
  {
    slug: "terraforming-mars",
    title: "Terraforming Mars",
    year: 2016,
    image: "/placeholder.svg?height=150&width=150&text=Terraforming+Mars",
    rating: 8.4,
    minPlayers: 1,
    maxPlayers: 5,
    playTime: "90-120 min",
    mechanics: ["Engine Building", "Card Drafting", "Tile Placement"],
    categories: ["Science Fiction", "Strategy"],
    currentListings: 5,
    priceRange: { min: 35, max: 52 },
    matchScore: 80,
    matchReasons: ["Engine Building", "Card Drafting", "Strategic depth"],
  },
  {
    slug: "gizmos",
    title: "Gizmos",
    year: 2018,
    image: "/placeholder.svg?height=150&width=150&text=Gizmos",
    rating: 7.1,
    minPlayers: 2,
    maxPlayers: 4,
    playTime: "40-50 min",
    mechanics: ["Engine Building", "Card Drafting"],
    categories: ["Science Fiction", "Strategy"],
    currentListings: 0,
    matchScore: 75,
    matchReasons: ["Engine Building", "Similar play time"],
  },
  {
    slug: "splendor",
    title: "Splendor",
    year: 2014,
    image: "/placeholder.svg?height=150&width=150&text=Splendor",
    rating: 7.4,
    minPlayers: 2,
    maxPlayers: 4,
    playTime: "30 min",
    mechanics: ["Engine Building", "Set Collection"],
    categories: ["Strategy"],
    currentListings: 2,
    priceRange: { min: 22, max: 30 },
    matchScore: 70,
    matchReasons: ["Engine Building", "Gateway strategy game"],
  },
]

export function SimilarGames({ currentGame, mechanics, categories }: SimilarGamesProps) {
  // Sort by match score
  const sortedGames = [...mockSimilarGames].sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Games You Might Also Like</h3>
        <p className="text-gray-600">Based on similar mechanics, themes, and player preferences</p>
      </div>

      <div className="grid gap-4">
        {sortedGames.map((game) => (
          <Card key={game.slug} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Game Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Game Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{game.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-warm-yellow text-warm-yellow" />
                        {game.rating}/10
                        <span>•</span>
                        <Users className="w-4 h-4" />
                        {game.minPlayers}-{game.maxPlayers}
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        {game.playTime}
                        <span>•</span>
                        <span>({game.year})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-2">{game.matchScore}% match</Badge>
                      {game.currentListings > 0 ? (
                        <div>
                          <div className="text-sm font-medium text-vibrant-orange">
                            €{game.priceRange!.min} - €{game.priceRange!.max}
                          </div>
                          <div className="text-xs text-gray-600">{game.currentListings} listings</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No current listings</div>
                      )}
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Similar because:</div>
                    <div className="flex flex-wrap gap-1">
                      {game.matchReasons.map((reason) => (
                        <Badge key={reason} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Mechanics */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Mechanics:</div>
                    <div className="flex flex-wrap gap-1">
                      {game.mechanics.slice(0, 3).map((mechanic) => (
                        <Badge
                          key={mechanic}
                          variant="outline"
                          className={`text-xs ${
                            mechanics.includes(mechanic)
                              ? "bg-vibrant-orange/10 border-vibrant-orange text-vibrant-orange"
                              : "bg-transparent"
                          }`}
                        >
                          {mechanic}
                        </Badge>
                      ))}
                      {game.mechanics.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-transparent">
                          +{game.mechanics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                      <Link href={`/game/${game.slug}`}>
                        {game.currentListings > 0 ? "View Listings" : "View Game"}
                      </Link>
                    </Button>
                    {game.currentListings === 0 && (
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Heart className="w-4 h-4 mr-1" />
                        Watch
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browse More */}
      <div className="text-center py-6 border-t">
        <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/games">Browse All Games</Link>
          </Button>
          <Button asChild className="bg-dark-green hover:bg-dark-green/90">
            <Link href="/list-game">List a Game</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
