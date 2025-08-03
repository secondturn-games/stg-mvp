"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Loader2, ExternalLink, Check, X, RotateCcw } from "lucide-react"
import { debounce } from "lodash"

interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  type?: string // Add type field
}

interface BGGGameDetails {
  id: string
  name: string
  yearpublished: string
  minplayers: string
  maxplayers: string
  playingtime: string
  minage: string
  description: string
  thumbnail: string
  image: string
  rating: string
  weight: string
  rank: string
  mechanics: string[]
  categories: string[]
  alternateNames: string[] // Add alternate names array
}

interface BGGSearchProps {
  onGameSelect: (game: BGGGameDetails | null) => void
  selectedGameId?: string
  gameType?: 'base-game' | 'expansion' | 'bundle'
}

export function BGGSearch({ onGameSelect, selectedGameId, gameType = 'base-game' }: BGGSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      setError(null)

      try {
        // CSV-first search - instant results
        const response = await fetch(`/api/bgg/search?query=${encodeURIComponent(query)}&gameType=${gameType}`)
        const data = await response.json()

        if (data.success) {
          setSearchResults(data.results)
        } else {
          setError(data.error || "Search failed")
          setSearchResults([])
        }
      } catch (err) {
        setError("Failed to search games")
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300), // Reduced debounce time since CSV search is instant
    [gameType], // Add gameType to dependencies
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleGameSelect = async (gameId: string) => {
    // Prevent multiple clicks while loading
    if (isLoadingDetails) return
    
    setIsLoadingDetails(true)
    setError(null)

    // Add timeout for slow responses
    const timeoutId = setTimeout(() => {
      if (isLoadingDetails) {
        setError("Loading is taking longer than expected. Please try again.")
        setIsLoadingDetails(false)
      }
    }, 10000) // 10 second timeout

    try {
      // Fetch detailed game data from BGG API
      const response = await fetch(`/api/bgg/game/${gameId}`)
      const data = await response.json()

      clearTimeout(timeoutId)

      if (data.success) {
        onGameSelect(data.game)
      } else {
        setError(data.error || "Failed to load game details")
      }
    } catch (err) {
      clearTimeout(timeoutId)
      setError("Failed to load game details")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleNewSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setError(null)
    onGameSelect(null) // Clear the selected game
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bgg-search">Search Games</Label>
          {selectedGameId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSearch}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              New Search
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="bgg-search"
            placeholder="Type a game name to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 border-warm-yellow focus:border-vibrant-orange"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
          {searchTerm && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Search Results:</Label>
            {isSearching && (
              <div className="flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Searching...</span>
              </div>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((game) => (
              <Card
                key={game.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedGameId === game.id
                    ? "border-vibrant-orange bg-warm-yellow/10 shadow-md"
                    : "hover:border-warm-yellow"
                } ${isLoadingDetails && selectedGameId === game.id ? "opacity-75" : ""}`}
                onClick={() => handleGameSelect(game.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{game.name}</h4>
                        {game.yearpublished && (
                          <Badge variant="secondary" className="text-xs">
                            {game.yearpublished}
                          </Badge>
                        )}
                        {game.type && (
                          <Badge 
                            variant={game.type === 'boardgameexpansion' ? 'outline' : 'default'} 
                            className={`text-xs ${
                              game.type === 'boardgameexpansion' 
                                ? 'border-vibrant-orange text-vibrant-orange' 
                                : 'bg-dark-green text-white'
                            }`}
                          >
                            {game.type === 'boardgameexpansion' ? 'Expansion' : 'Base Game'}
                          </Badge>
                        )}
                        {selectedGameId === game.id && !isLoadingDetails && <Check className="w-4 h-4 text-vibrant-orange" />}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">BGG ID: {game.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-vibrant-orange hover:text-vibrant-orange/80"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`https://boardgamegeek.com/boardgame/${game.id}`, "_blank")
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on BGG
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                    {isLoadingDetails && selectedGameId === game.id && (
                        <>
                      <Loader2 className="w-4 h-4 animate-spin text-vibrant-orange" />
                          <span className="text-xs text-vibrant-orange">Loading details...</span>
                        </>
                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && !error && (
        <div className="text-center py-6 px-4">
          <div className="text-gray-500 text-sm mb-2">No games found for "{searchTerm}"</div>
          <div className="text-xs text-gray-400 max-w-sm mx-auto space-y-1">
            <div>💡 Try these suggestions:</div>
            <div>• Check your spelling (e.g., "Wingspan" not "Wngspn")</div>
            <div>• Use the game's primary name from{" "}
              <a 
                href="https://boardgamegeek.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-vibrant-orange hover:underline"
              >
                BoardGameGeek
              </a>
            </div>
          </div>
        </div>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <div className="text-center py-4 text-gray-500 text-sm">Type at least 2 characters to search</div>
      )}

      {/* Loading overlay for game selection */}
      {isLoadingDetails && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-vibrant-orange" />
              <div>
                <h3 className="font-medium text-gray-900">Loading Game Details</h3>
                <p className="text-sm text-gray-500">Fetching information from BoardGameGeek...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
