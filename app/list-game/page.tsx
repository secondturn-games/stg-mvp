"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Euro, Gavel, ExternalLink } from "lucide-react"
import { Navigation } from "@/components/navigation"

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
  alternateNames: string[]
  versions?: BGGGameVersion[]
  type?: string
}

interface BGGGameVersion {
  id: string
  name: string
  yearpublished: string
  publisher: string
  language: string
  productcode: string
  thumbnail: string
  image: string
  width: string
  length: string
  depth: string
  weight: string
}

interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  type?: string
  alternateNames?: string[]
  abstracts_rank?: string
  cgs_rank?: string
  childrensgames_rank?: string
  familygames_rank?: string
  partygames_rank?: string
  strategygames_rank?: string
  thematic_rank?: string
  wargames_rank?: string
  thumbnail?: string
  bggLink?: string
}

interface FormData {
  title: string
  year: string
  players: string
  playtime: string
  age: string
  description: string
  condition: string
  price: string
  conditionNotes: string
  country: string
  city: string
  includedItems: string[]
  tradingOptions: string[]
  listingType: "base-game" | "expansion" | "bundle"
  saleType: "fixed-price" | "auction"
  baseGame: string
  expansions: string[]
  bundleItems: string[]
  versionId: string
  versionName: string
  versionPublisher: string
  versionLanguage: string
  versionYear: string
  versionProductCode: string
  startingBid: string
  reservePrice: string
  buyNowPrice: string
  auctionDuration: string
  auctionEndTime: string
  allowBuyNow: boolean
  hasReserve: boolean
}

export default function ListGamePage() {
  const [currentStep, setCurrentStep] = useState<'sale-type' | 'search' | 'game-details' | 'listing-details'>('sale-type')
  const [saleType, setSaleType] = useState<'fixed-price' | 'auction'>('fixed-price')
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedBGGGame, setSelectedBGGGame] = useState<BGGGameDetails | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<BGGGameVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>("main-title")
  const [selectedExpansions, setSelectedExpansions] = useState<BGGSearchResult[]>([])
  const [showExpansionSearch, setShowExpansionSearch] = useState(false)
  
  // Add search filter states
  const [searchFilters, setSearchFilters] = useState({
    gameType: 'base-game' as 'base-game' | 'expansion'
  })

  // Abort controller for cancelling previous requests
  const abortControllerRef = useRef<AbortController | null>(null)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    year: "",
    players: "",
    playtime: "",
    age: "",
    description: "",
    condition: "",
    price: "",
    conditionNotes: "",
    country: "",
    city: "",
    includedItems: [],
    tradingOptions: [],
    listingType: "base-game",
    saleType: "fixed-price",
    baseGame: "",
    expansions: [],
    bundleItems: [],
    versionId: "",
    versionName: "",
    versionPublisher: "",
    versionLanguage: "",
    versionYear: "",
    versionProductCode: "",
    startingBid: "",
    reservePrice: "",
    buyNowPrice: "",
    auctionDuration: "7",
    auctionEndTime: "",
    allowBuyNow: false,
    hasReserve: false,
  })

  const performSearch = async (customGameType?: 'base-game' | 'expansion') => {
    const trimmedQuery = searchTerm.trim()
    
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchError('Please enter at least 2 characters to search')
      return
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    // Use custom game type if provided, otherwise use current state
    const gameTypeToUse = customGameType || searchFilters.gameType

    console.log(`🔍 Frontend: Starting search for "${trimmedQuery}" with game type: ${gameTypeToUse}`)
    setIsSearching(true)
    setSearchError('')
    setHasSearched(true)

    try {
      // Build query parameters with filters
      const params = new URLSearchParams({
        query: trimmedQuery,
        gameType: gameTypeToUse
      })

      const response = await fetch(`/api/bgg/search?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Search failed: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results)
      } else {
        setSearchError(data.error || 'Search failed')
      }
    } catch (error) {
      // Don't show error if request was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 Frontend: Search request cancelled')
        return
      }
      
      console.error('🔍 Frontend: Search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Search failed. Please try again.')
    } finally {
      console.log('🔍 Search completed')
      setIsSearching(false)
    }
  }

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleGameSelect = (game: BGGGameDetails | null) => {
    setSelectedBGGGame(game)
    setSelectedVersion(null)
    setSelectedTitleVariant("main-title")
    setSelectedExpansions([])
    
    if (game) {
      setFormData(prev => ({
        ...prev,
        title: game.name,
        year: game.yearpublished,
        players: `${game.minplayers}-${game.maxplayers}`,
        playtime: game.playingtime,
        age: game.minage,
        description: game.description,
        baseGame: game.id,
      }))
      setCurrentStep('game-details')
    }
  }

  const handleNextStep = () => {
    if (currentStep === 'sale-type') {
      setCurrentStep('search')
    } else if (currentStep === 'search' && selectedBGGGame) {
      setCurrentStep('game-details')
    } else if (currentStep === 'game-details') {
      setCurrentStep('listing-details')
    }
  }

  const handleBackStep = () => {
    if (currentStep === 'search') {
      setCurrentStep('sale-type')
    } else if (currentStep === 'game-details') {
      setCurrentStep('search')
    } else if (currentStep === 'listing-details') {
      setCurrentStep('game-details')
    }
  }

  return (
    <div className="min-h-screen bg-light-beige">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-green">Create New Listing</h1>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className={`flex items-center ${currentStep === 'sale-type' ? 'text-vibrant-orange' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'sale-type' ? 'bg-vibrant-orange text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Sale Type</span>
              </div>
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'search' || currentStep === 'game-details' || currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${currentStep === 'search' ? 'text-vibrant-orange' : currentStep === 'game-details' || currentStep === 'listing-details' ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'search' ? 'bg-vibrant-orange text-white' : currentStep === 'game-details' || currentStep === 'listing-details' ? 'bg-gray-300' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Find Game</span>
              </div>
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'game-details' || currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${currentStep === 'game-details' ? 'text-vibrant-orange' : currentStep === 'listing-details' ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'game-details' ? 'bg-vibrant-orange text-white' : currentStep === 'listing-details' ? 'bg-gray-300' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Game Details</span>
              </div>
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${currentStep === 'listing-details' ? 'text-vibrant-orange' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'listing-details' ? 'bg-vibrant-orange text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Listing Details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'sale-type' && (
          <Card>
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-dark-green text-lg lg:text-xl">Choose Sale Type</CardTitle>
                  <CardDescription className="text-sm">Select how you want to sell your game</CardDescription>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="https://boardgamegeek.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Image
                      src="/powered-by-bgg-rgb.svg"
                      alt="Powered by BoardGameGeek"
                      width={120}
                      height={40}
                    />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    saleType === 'fixed-price' 
                      ? 'border-vibrant-orange bg-warm-yellow/10' 
                      : 'border-gray-200 hover:border-vibrant-orange/50'
                  }`}
                  onClick={() => setSaleType('fixed-price')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                      <Euro className="w-6 h-6 text-vibrant-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-green">Fixed Price</h3>
                      <p className="text-sm text-gray-600">Set a specific price for your game</p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    saleType === 'auction' 
                      ? 'border-vibrant-orange bg-warm-yellow/10' 
                      : 'border-gray-200 hover:border-vibrant-orange/50'
                  }`}
                  onClick={() => setSaleType('auction')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                      <Gavel className="w-6 h-6 text-vibrant-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-green">Auction</h3>
                      <p className="text-sm text-gray-600">Let buyers bid on your game</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleNextStep} className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'search' && (
          <Card>
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-dark-green text-lg lg:text-xl">Find Your Game</CardTitle>
                  <CardDescription className="text-sm">Choose base game or expansion</CardDescription>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="https://boardgamegeek.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Image
                      src="/powered-by-bgg-rgb.svg"
                      alt="Powered by BoardGameGeek"
                      width={120}
                      height={40}
                    />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Game Type Switch */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setSearchFilters({ gameType: 'base-game' })
                      // Clear results when switching filters
                      setSearchResults([])
                      setSearchError('')
                      // Auto-search if there's a search term
                      if (searchTerm.trim().length >= 2) {
                        performSearch('base-game')
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                      searchFilters.gameType === 'base-game'
                        ? 'bg-vibrant-orange text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Base Game
                  </button>
                  <button
                    onClick={() => {
                      setSearchFilters({ gameType: 'expansion' })
                      // Clear results when switching filters
                      setSearchResults([])
                      setSearchError('')
                      // Auto-search if there's a search term
                      if (searchTerm.trim().length >= 2) {
                        performSearch('expansion')
                      }
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                      searchFilters.gameType === 'expansion'
                        ? 'bg-vibrant-orange text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Expansion
                  </button>
                </div>

                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="search"
                      placeholder="Type in the name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          performSearch()
                        }
                      }}
                      className="border-warm-yellow focus:border-vibrant-orange placeholder:text-gray-400 text-sm lg:text-base"
                    />
                    
                    {/* Clear button - show when there's text in the input */}
                    {searchTerm.trim().length > 0 && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setSearchResults([])
                          setSearchError("")
                          setIsSearching(false)
                          setHasSearched(false)
                          // Cancel any ongoing search
                          if (abortControllerRef.current) {
                            abortControllerRef.current.abort()
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                        title="Clear search"
                      >
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => performSearch()}
                    disabled={searchTerm.trim().length < 2 || isSearching}
                    className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white px-4"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>

              {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && !isSearching && (
                <div className="p-3 bg-light-green/50 border border-light-green rounded-lg">
                  <p className="text-sm lg:text-base text-dark-green">
                    💡 Please enter at least 2 characters to search for games
                  </p>
                </div>
              )}



              {searchError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm lg:text-base text-red-700">{searchError}</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm lg:text-base font-medium">Search Results:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setSearchResults([])
                        setSearchError("")
                        setIsSearching(false)
                        setHasSearched(false)
                        // Cancel any ongoing search
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort()
                        }
                      }}
                      className="text-xs border-vibrant-orange text-vibrant-orange hover:bg-vibrant-orange hover:text-white"
                    >
                      New Search
                    </Button>
                  </div>
                  <div className="max-h-64 lg:max-h-96 overflow-y-auto space-y-2">
                    {searchResults.map((game) => (
                      <Card
                        key={game.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-warm-yellow"
                        onClick={() => handleGameSelect(game as any)}
                      >
                        <CardContent className="p-3 lg:p-4">
                          <div className="flex items-center space-x-3">
                            {game.thumbnail ? (
                              <img 
                                src={game.thumbnail} 
                                alt={game.name}
                                className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">🎲</span>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm lg:text-base truncate">{game.name}</h4>
                                {game.yearpublished && (
                                  <Badge variant="secondary" className="text-xs">
                                    {game.yearpublished}
                                  </Badge>
                                )}
                                {game.rank && parseInt(game.rank) > 0 && game.type !== 'expansion' && (
                                  <Badge className="bg-vibrant-orange text-white text-xs">
                                    #{game.rank}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={game.type === 'expansion' ? 'outline' : 'default'} 
                                  className={`text-xs px-1.5 py-0.5 ${
                                    game.type === 'expansion' 
                                      ? 'border-vibrant-orange text-vibrant-orange' 
                                      : 'bg-dark-green text-white'
                                  }`}
                                >
                                  {game.type === 'expansion' ? 'Expansion' : 'Base Game'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1">
                                <a
                                  href={game.bggLink || `https://boardgamegeek.com/boardgame/${game.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-500 hover:text-vibrant-orange hover:underline transition-colors flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                                >
                                  BGG ID: {game.id}
                                  <ExternalLink className="w-3 h-3 text-vibrant-orange" />
                                </a>
                                {game.bayesaverage && (
                                  <span 
                                    className="text-xs font-medium"
                                    style={{
                                      color: parseFloat(game.bayesaverage) >= 7.0 ? '#059669' : 
                                             parseFloat(game.bayesaverage) >= 6.0 ? '#D97706' : '#DC2626'
                                    }}
                                  >
                                    ★ {parseFloat(game.bayesaverage).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No results found message */}
              {hasSearched && !isSearching && searchResults.length === 0 && !searchError && (
                <div className="p-4 bg-light-green/30 border border-light-green rounded-lg text-center">
                  <p className="text-sm lg:text-base text-dark-green font-medium mb-2">
                    Hmm, we didn't find that one.
                  </p>
                  <p className="text-xs lg:text-sm text-dark-green/80">
                    Try tweaking the name or spelling. If you're sure it exists, let us know at{' '}
                    <a 
                      href="mailto:info@secondturn.games" 
                      className="text-vibrant-orange hover:underline font-medium"
                    >
                      info@secondturn.games
                    </a>
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBackStep} size="sm" className="text-sm">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'game-details' && selectedBGGGame && (
          <Card>
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-dark-green text-lg lg:text-xl">Game Details</CardTitle>
                  <CardDescription className="text-sm">Configure your game listing details</CardDescription>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="https://boardgamegeek.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Image
                      src="/powered-by-bgg-rgb.svg"
                      alt="Powered by BoardGameGeek"
                      width={120}
                      height={40}
                    />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3 lg:space-x-4">
                  {selectedBGGGame.thumbnail && (
                    <img 
                      src={selectedBGGGame.thumbnail} 
                      alt={selectedBGGGame.name}
                      className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-800 text-sm lg:text-base truncate">{selectedBGGGame.name}</h3>
                    <p className="text-xs lg:text-sm text-blue-700">
                      {selectedBGGGame.yearpublished} • {selectedBGGGame.minplayers}-{selectedBGGGame.maxplayers} players
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Game Title</Label>
                <Select
                  value={selectedTitleVariant}
                  onValueChange={(value) => {
                    setSelectedTitleVariant(value)
                    if (value === "main-title") {
                      setFormData(prev => ({ ...prev, title: selectedBGGGame.name }))
                    } else {
                      setFormData(prev => ({ ...prev, title: value }))
                    }
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select a title variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main-title">Main Title ({selectedBGGGame.name})</SelectItem>
                    {selectedBGGGame.alternateNames && selectedBGGGame.alternateNames.map((altName, index) => (
                      <SelectItem key={`${selectedBGGGame.id}-alt-${index}`} value={altName}>
                        {altName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBGGGame.versions && selectedBGGGame.versions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-medium">Game Version (Optional)</Label>
                  <Select
                    value={selectedVersion?.id || "main-game"}
                    onValueChange={(value) => {
                      if (value === "main-game") {
                        setSelectedVersion(null)
                        setFormData(prev => ({
                          ...prev,
                          versionId: "",
                          versionName: "",
                          versionPublisher: "",
                          versionLanguage: "",
                          versionYear: "",
                          versionProductCode: "",
                        }))
                      } else {
                        const version = selectedBGGGame.versions?.find(v => v.id === value) || null
                        setSelectedVersion(version)
                        if (version) {
                          setFormData(prev => ({
                            ...prev,
                            versionId: version.id,
                            versionName: version.name,
                            versionPublisher: version.publisher,
                            versionLanguage: version.language,
                            versionYear: version.yearpublished,
                            versionProductCode: version.productcode,
                          }))
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a specific version/edition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-game">Main Game (No specific version)</SelectItem>
                      {selectedBGGGame.versions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          <div className="text-sm">
                            <div className="font-medium">{version.name}</div>
                            <div className="text-xs text-gray-500">({version.language}, {version.yearpublished})</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.listingType === "base-game" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Add Expansions & Promos</Label>
                    <Badge variant="outline" className="text-xs">Premium Feature</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExpansionSearch(true)}
                    className="w-full border-warm-yellow text-dark-green hover:bg-warm-yellow/10 text-sm"
                    disabled
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expansion or Promo (Premium)
                  </Button>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBackStep} size="sm" className="text-sm">
                  Back
                </Button>
                <Button onClick={handleNextStep} className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'listing-details' && (
          <Card>
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-dark-green text-lg lg:text-xl">Listing Details</CardTitle>
                  <CardDescription className="text-sm">Configure your listing details</CardDescription>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href="https://boardgamegeek.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Image
                      src="/powered-by-bgg-rgb.svg"
                      alt="Powered by BoardGameGeek"
                      width={120}
                      height={40}
                    />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6 lg:py-8">
                <p className="text-gray-600 text-sm lg:text-base">This step will be implemented next</p>
                <p className="text-xs lg:text-sm text-gray-500 mt-2">Description, condition, price, photos, etc.</p>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBackStep} size="sm" className="text-sm">
                  Back
                </Button>
                <Button disabled className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm">
                  Create Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
