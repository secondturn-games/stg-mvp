"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Euro, Package, Filter, Plus } from "lucide-react"
import Link from "next/link"
import type { Listing } from "@/types"
import { Navigation } from "@/components/navigation"

export default function GamesPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/listings')
      const data = await response.json()

      if (data.success) {
        setListings(data.listings)
      } else {
        setError(data.error || 'Failed to fetch listings')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCondition = !selectedCondition || listing.condition === selectedCondition
    const matchesCountry = !selectedCountry || listing.country === selectedCountry

    return matchesSearch && matchesCondition && matchesCountry
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading games...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-dark-green">Browse Games</h1>
                <p className="text-gray-600 mt-2">Find your next favorite board game</p>
              </div>
              <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                <Link href="/list-game">
                  <Plus className="w-4 h-4 mr-2" />
                  List a Game
                </Link>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCondition || undefined} onValueChange={(value) => setSelectedCondition(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="very-good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCountry || undefined} onValueChange={(value) => setSelectedCountry(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  <SelectItem value="estonia">🇪🇪 Estonia</SelectItem>
                  <SelectItem value="latvia">🇱🇻 Latvia</SelectItem>
                  <SelectItem value="lithuania">🇱🇹 Lithuania</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setSearchTerm("")
                setSelectedCondition(null)
                setSelectedCountry(null)
              }}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
              <p className="text-gray-600 mb-6">
                {listings.length === 0 
                  ? "No games have been listed yet. Be the first to list a game!"
                  : "Try adjusting your search or filters."
                }
              </p>
              {listings.length === 0 && (
                <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                  <Link href="/list-game">
                    <Plus className="w-4 h-4 mr-2" />
                    List Your First Game
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card 
                  key={listing.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/listing/${listing.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-dark-green truncate">
                          {listing.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          {listing.users?.full_name || listing.users?.username} • {listing.city}, {listing.country}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-vibrant-orange">
                          €{listing.price}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {listing.condition}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.city}
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-3 h-3 mr-1" />
                        {listing.trading_options?.length || 0} options
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
