"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Dice1, Dice6, Star, Users, Clock, Eye, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"


interface SearchResult {
  type: "marketplace" | "bgg"
  slug?: string
  bggId: string
  title: string
  year?: number
  image: string
  rating?: number
  minPlayers?: number
  maxPlayers?: number
  playTime?: string
  currentListings: number
  priceRange?: { min: number; max: number }
  watcherCount?: number
  description?: string
}

// Mock search results combining marketplace and BGG data
const mockSearchResults: SearchResult[] = [
  // Games with current listings
  {
    type: "marketplace",
    slug: "wingspan",
    bggId: "266192",
    title: "Wingspan",
    year: 2019,
    image: "/placeholder.svg?height=150&width=150&text=Wingspan",
    rating: 8.1,
    minPlayers: 1,
    maxPlayers: 5,
    playTime: "40-70 min",
    currentListings: 4,
    priceRange: { min: 35, max: 55 },
    description: "A competitive bird-themed engine-building board game.",
  },
  {
    type: "marketplace",
    slug: "azul",
    bggId: "230802",
    title: "Azul",
    year: 2017,
    image: "/placeholder.svg?height=150&width=150&text=Azul",
    rating: 7.8,
    minPlayers: 2,
    maxPlayers: 4,
    playTime: "30-45 min",
    currentListings: 3,
    priceRange: { min: 25, max: 35 },
    description: "A tile-laying game inspired by Portuguese tiles.",
  },
  // Games without current listings (BGG only)
  {
    type: "bgg",
    bggId: "167791",
    title: "Terraforming Mars",
    year: 2016,
    image: "/placeholder.svg?height=150&width=150&text=Terraforming+Mars",
    rating: 8.4,
    minPlayers: 1,
    maxPlayers: 5,
    playTime: "90-120 min",
    currentListings: 0,
    watcherCount: 23,
    description: "Transform Mars into a habitable planet in this engine-building game.",
  },
  {
    type: "bgg",
    bggId: "174430",
    title: "Gloomhaven",
    year: 2017,
    image: "/placeholder.svg?height=150&width=150&text=Gloomhaven",
    rating: 8.7,
    minPlayers: 1,
    maxPlayers: 4,
    playTime: "60-120 min",
    currentListings: 0,
    watcherCount: 67,
    description: "A tactical combat game in a persistent world of shifting motives.",
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Filter results based on active tab
  const filteredResults = searchResults.filter((result) => {
    if (activeTab === "available") return result.currentListings > 0
    if (activeTab === "wanted") return result.currentListings === 0
    return true
  })

  const availableCount = searchResults.filter((r) => r.currentListings > 0).length
  const wantedCount = searchResults.filter((r) => r.currentListings === 0).length

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setIsLoading(true)
    // In production, this would be real API calls to both marketplace and BGG
    setTimeout(() => {
      const filtered = mockSearchResults.filter((game) => game.title.toLowerCase().includes(query.toLowerCase()))
      setSearchResults(filtered)
      setIsLoading(false)
    }, 500)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Board Games</h1>
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for any board game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-base border-warm-yellow focus:border-vibrant-orange"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-vibrant-orange hover:bg-vibrant-orange/90"
                size="sm"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isLoading ? "Searching..." : `Results for "${searchQuery}"`}</h2>
              {!isLoading && searchResults.length > 0 && (
                <div className="text-sm text-gray-600">{searchResults.length} games found</div>
              )}
            </div>

            {/* Results Tabs */}
            {!isLoading && searchResults.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
                  <TabsTrigger value="available">Available ({availableCount})</TabsTrigger>
                  <TabsTrigger value="wanted">Wanted ({wantedCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <SearchResultsList results={filteredResults} />
                </TabsContent>

                <TabsContent value="available" className="space-y-4">
                  <SearchResultsList results={filteredResults} />
                </TabsContent>

                <TabsContent value="wanted" className="space-y-4">
                  <div className="mb-4 p-4 bg-light-beige rounded-lg border-l-4 border-warm-yellow">
                    <h3 className="font-medium text-sm mb-1">Games Not Currently Listed</h3>
                    <p className="text-sm text-gray-600">
                      These games aren't available right now, but you can watch them or create alerts to be notified
                      when they become available.
                    </p>
                  </div>
                  <SearchResultsList results={filteredResults} />
                </TabsContent>
              </Tabs>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults.length === 0 && searchQuery && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No games found</h3>
                    <p className="text-gray-500 mb-4">
                      We couldn't find any games matching "{searchQuery}". Try different keywords or browse our
                      available games.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild className="bg-transparent">
                      <Link href="/games">Browse All Games</Link>
                    </Button>
                    <Button asChild className="bg-dark-green hover:bg-dark-green/90">
                      <Link href="/list-game">List This Game</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-light-beige rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-vibrant-orange" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Search Any Board Game</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Find games from our marketplace or discover new games from BoardGameGeek's database. Create alerts for
              games you want but aren't available yet.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-vibrant-orange rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium mb-2">Find Listings</h3>
                <p className="text-sm text-gray-600">Search games with active marketplace listings</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-dark-green rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium mb-2">Discover Games</h3>
                <p className="text-sm text-gray-600">Explore any game from BGG's database</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-12 h-12 bg-warm-yellow rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium mb-2">Create Alerts</h3>
                <p className="text-sm text-gray-600">Get notified when games become available</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Search Results List Component
function SearchResultsList({ results }: { results: SearchResult[] }) {
  const [watchedGames, setWatchedGames] = useState<Set<string>>(new Set())

  const toggleWatch = (bggId: string) => {
    const newWatched = new Set(watchedGames)
    if (newWatched.has(bggId)) {
      newWatched.delete(bggId)
    } else {
      newWatched.add(bggId)
    }
    setWatchedGames(newWatched)
  }

  return (
    <div className="space-y-4">
      {results.map((game) => (
        <Card key={game.bggId} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Game Image */}
              <div className="flex-shrink-0">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Game Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold hover:text-vibrant-orange transition-colors">
                      <Link href={`/game/${game.slug || `bgg-${game.bggId}`}`}>{game.title}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {game.rating && (
                        <>
                          <Star className="w-4 h-4 fill-warm-yellow text-warm-yellow" />
                          {game.rating}/10
                        </>
                      )}
                      {game.minPlayers && game.maxPlayers && (
                        <>
                          <span>•</span>
                          <Users className="w-4 h-4" />
                          {game.minPlayers}-{game.maxPlayers}
                        </>
                      )}
                      {game.playTime && (
                        <>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          {game.playTime}
                        </>
                      )}
                      {game.year && (
                        <>
                          <span>•</span>
                          <span>({game.year})</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    {game.currentListings > 0 ? (
                      <Badge className="bg-green-100 text-green-800 mb-2">{game.currentListings} Available</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 mb-2">
                        Not Listed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {game.description && <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>}

                {/* Price or Watcher Info */}
                <div className="flex items-center justify-between">
                  <div>
                    {game.priceRange ? (
                      <div className="text-lg font-bold text-vibrant-orange">
                        €{game.priceRange.min} - €{game.priceRange.max}
                      </div>
                    ) : game.watcherCount ? (
                      <div className="text-sm text-gray-600">{game.watcherCount} people watching</div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {game.currentListings > 0 ? (
                      <Button asChild size="sm" className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                        <Link href={`/game/${game.slug}`}>View Listings</Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => toggleWatch(game.bggId)}
                          variant={watchedGames.has(game.bggId) ? "default" : "outline"}
                          size="sm"
                          className={
                            watchedGames.has(game.bggId)
                              ? "bg-vibrant-orange hover:bg-vibrant-orange/90"
                              : "bg-transparent"
                          }
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          {watchedGames.has(game.bggId) ? "Watching" : "Watch"}
                        </Button>
                        <Button asChild size="sm" variant="outline" className="bg-transparent">
                          <Link href={`/game/bgg-${game.bggId}`}>View Game</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
