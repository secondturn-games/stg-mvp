"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Euro, Gavel, ExternalLink, Star, Package, Calendar, Users, Cake, Clock, Type } from "lucide-react"
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
  publishers: string[]
  languages: string[]
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

  const handleGameSelect = async (game: BGGSearchResult | BGGGameDetails | null) => {
    if (!game) {
      setSelectedBGGGame(null)
      setSelectedVersion(null)
      setSelectedTitleVariant("main-title")
      setSelectedExpansions([])
      return
    }

    // If it's already a BGGGameDetails object (has versions), use it directly
    if ('versions' in game) {
      setSelectedBGGGame(game as BGGGameDetails)
      setSelectedVersion(null)
      setSelectedTitleVariant("main-title")
      setSelectedExpansions([])
      
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
      return
    }

    // If it's a BGGSearchResult, fetch the full game details
    try {
      console.log(`🔍 Fetching full details for game ${game.id}: ${game.name}`)
      const response = await fetch(`/api/bgg/game/${game.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch game details: ${response.status}`)
      }
      
      const responseData = await response.json()
      const gameDetails: BGGGameDetails = responseData.game
      console.log(`✅ Fetched game details for ${gameDetails.name}, versions: ${gameDetails.versions?.length || 0}`)
      
      setSelectedBGGGame(gameDetails)
      setSelectedVersion(null)
      setSelectedTitleVariant("main-title")
      setSelectedExpansions([])
      
      setFormData(prev => ({
        ...prev,
        title: gameDetails.name,
        year: gameDetails.yearpublished,
        players: `${gameDetails.minplayers}-${gameDetails.maxplayers}`,
        playtime: gameDetails.playingtime,
        age: gameDetails.minage,
        description: gameDetails.description,
        baseGame: gameDetails.id,
      }))
      setCurrentStep('game-details')
    } catch (error) {
      console.error('Error fetching game details:', error)
      // Fallback to using the search result data
      const fallbackGame: BGGGameDetails = {
         id: game.id,
         name: game.name,
         yearpublished: game.yearpublished || '',
         minplayers: '',
         maxplayers: '',
         playingtime: '',
         minage: '',
         description: '',
         thumbnail: game.thumbnail || '',
         image: '',
         rating: (game as BGGSearchResult).bayesaverage || '',
         weight: '',
         rank: (game as BGGSearchResult).rank || '',
         mechanics: [],
         categories: [],
         alternateNames: (game as BGGSearchResult).alternateNames || [],
         type: game.type,
       }
       
       setSelectedBGGGame(fallbackGame)
       setSelectedVersion(null)
       setSelectedTitleVariant("main-title")
       setSelectedExpansions([])
       
       setFormData(prev => ({
         ...prev,
         title: fallbackGame.name,
         year: fallbackGame.yearpublished,
         players: `${fallbackGame.minplayers}-${fallbackGame.maxplayers}`,
         playtime: fallbackGame.playingtime,
         age: fallbackGame.minage,
         description: fallbackGame.description,
         baseGame: fallbackGame.id,
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


        {/* Step Indicator */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className={`flex items-center ${currentStep === 'sale-type' ? 'text-vibrant-orange' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'sale-type' ? 'bg-vibrant-orange text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Listing Type</span>
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
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-green text-lg lg:text-xl">Choose Listing Type</CardTitle>
                <CardDescription className="text-sm">Set the stage for your game’s next adventure</CardDescription>
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
                        <p className="text-sm text-gray-600">You set the price</p>
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
                        <p className="text-sm text-gray-600">Let the community decide</p>
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
            
            {/* BGG Logo */}
            <div className="flex justify-center mt-6">
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
          </>
        )}

        {currentStep === 'search' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-green text-lg lg:text-xl">Find Your Game</CardTitle>
                <CardDescription className="text-sm">Filter between base games or expansions, and we’ll bring up official data from BGG</CardDescription>
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
                  <div className="max-h-64 lg:max-h-96 overflow-y-auto space-y-2">
                    {searchResults.map((game) => (
                      <Card
                        key={game.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-warm-yellow"
                        onClick={() => handleGameSelect(game)}
                      >
                        <CardContent className="p-3 lg:p-4">
                          <div className="flex items-center space-x-3">
                            {game.thumbnail ? (
                              <img 
                                src={game.thumbnail} 
                                alt={game.name}
                                className="w-14 h-14 lg:w-18 lg:h-18 object-cover rounded-lg flex-shrink-0 shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-14 h-14 lg:w-18 lg:h-18 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
                                <span className="text-gray-400 text-xs">🎲</span>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm lg:text-base leading-tight mb-1 break-words">{game.name}</h4>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {game.yearpublished && (
                                    <span className="text-xs text-gray-600">
                                      {game.yearpublished}
                                    </span>
                                  )}
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
            
            {/* BGG Logo */}
            <div className="flex justify-center mt-6">
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
          </>
        )}

        {currentStep === 'game-details' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-green text-lg lg:text-xl">Game Details</CardTitle>
                <CardDescription className="text-sm">Let’s make sure everything matches what you're listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                                          {/* Selected Game Display */}
                <div className="bg-light-beige/50 rounded-lg p-4 border border-warm-yellow/20">
                  {/* Mobile: Vertical layout */}
                  <div className="block lg:hidden">
                    {/* Image centered on top */}
                    <div className="flex justify-center mb-4">
                      <Image
                        src={selectedVersion?.image || selectedVersion?.thumbnail || selectedBGGGame?.image || selectedBGGGame?.thumbnail || "/placeholder-game.jpg"}
                        alt={selectedVersion?.name || selectedBGGGame?.name || "Game thumbnail"}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover shadow-sm"
                      />
                    </div>
                    
                    {/* Content below image */}
                    <div className="text-center">
                      {/* Title */}
                      <h3 className="font-semibold text-[#29432B] text-lg mb-1">
                        {selectedTitleVariant === "main-title" 
                          ? selectedBGGGame?.name || 'Unknown Game'
                          : selectedTitleVariant
                        }
                      </h3>
                      
                      {/* Subtitle - Version Name */}
                      {selectedVersion && (
                        <p className="text-sm text-vibrant-orange font-medium mb-3">
                          {selectedVersion.name}
                        </p>
                      )}
                      
                      {/* Basic Stats */}
                      <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-xs text-dark-green">
                          <Calendar className="w-3 h-3" />
                          <span>{selectedVersion?.yearpublished || selectedBGGGame?.yearpublished || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-dark-green">
                          <Users className="w-3 h-3" />
                          <span>{selectedBGGGame?.minplayers || '?'}-{selectedBGGGame?.maxplayers || '?'}</span>
                        </div>
                        {selectedBGGGame?.minage && selectedBGGGame.minage !== '0' && (
                          <div className="flex items-center gap-1 text-xs text-dark-green">
                            <Cake className="w-3 h-3" />
                            <span>{selectedBGGGame.minage}+</span>
                          </div>
                        )}
                        {selectedBGGGame?.playingtime && (
                          <div className="flex items-center gap-1 text-xs text-dark-green">
                            <Clock className="w-3 h-3" />
                            <span>~{selectedBGGGame.playingtime}</span>
                          </div>
                        )}
                        {selectedBGGGame?.type === 'expansion' && (
                          <Badge className="bg-dark-green text-white text-xs">
                            Expansion
                          </Badge>
                        )}
                      </div>
                      
                                         {/* Version-specific info */}
                       {selectedVersion && (
                         <div className="flex flex-wrap items-center justify-center gap-1.5">
                           {selectedVersion.languages && selectedVersion.languages.length > 0 && (
                             <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">
                               {selectedVersion.languages.join(', ')}
                             </Badge>
                           )}
                           {selectedVersion.publishers && selectedVersion.publishers.length > 0 && (
                             <Badge variant="outline" className="text-xs border-dark-green text-dark-green">
                               {selectedVersion.publishers.join(', ')}
                             </Badge>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Desktop: Horizontal layout */}
                  <div className="hidden lg:flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={selectedVersion?.image || selectedVersion?.thumbnail || selectedBGGGame?.image || selectedBGGGame?.thumbnail || "/placeholder-game.jpg"}
                        alt={selectedVersion?.name || selectedBGGGame?.name || "Game thumbnail"}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover shadow-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="font-semibold text-[#29432B] text-lg truncate mb-1">
                        {selectedTitleVariant === "main-title" 
                          ? selectedBGGGame?.name || 'Unknown Game'
                          : selectedTitleVariant
                        }
                      </h3>
                      
                      {/* Subtitle - Version Name */}
                      {selectedVersion && (
                        <p className="text-sm text-vibrant-orange font-medium mb-3">
                          {selectedVersion.name}
                        </p>
                      )}
                      
                      {/* Basic Stats */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-xs text-dark-green">
                          <Calendar className="w-3 h-3" />
                          <span>{selectedVersion?.yearpublished || selectedBGGGame?.yearpublished || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-dark-green">
                          <Users className="w-3 h-3" />
                          <span>{selectedBGGGame?.minplayers || '?'}-{selectedBGGGame?.maxplayers || '?'}</span>
                        </div>
                        {selectedBGGGame?.minage && selectedBGGGame.minage !== '0' && (
                          <div className="flex items-center gap-1 text-xs text-dark-green">
                            <Cake className="w-3 h-3" />
                            <span>{selectedBGGGame.minage}+</span>
                          </div>
                        )}
                        {selectedBGGGame?.playingtime && (
                          <div className="flex items-center gap-1 text-xs text-dark-green">
                            <Clock className="w-3 h-3" />
                            <span>~{selectedBGGGame.playingtime}</span>
                          </div>
                        )}
                        {selectedBGGGame?.type === 'expansion' && (
                          <Badge className="bg-dark-green text-white text-xs">
                            Expansion
                          </Badge>
                        )}
                      </div>
                      
                                         {/* Version-specific info */}
                       {selectedVersion && (
                         <div className="flex flex-wrap items-center gap-1.5">
                           {selectedVersion.languages && selectedVersion.languages.length > 0 && (
                             <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">
                               {selectedVersion.languages.join(', ')}
                             </Badge>
                           )}
                           {selectedVersion.publishers && selectedVersion.publishers.length > 0 && (
                             <Badge variant="outline" className="text-xs border-dark-green text-dark-green">
                               {selectedVersion.publishers.join(', ')}
                             </Badge>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                                {/* Enhanced Version Selection */}
                <div className="space-y-4">

                    {/* Version Selection */}
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
                          const version = selectedBGGGame?.versions?.find(v => v.id === value) || null
                          setSelectedVersion(version)
                          if (version) {
                            setFormData(prev => ({
                              ...prev,
                              versionId: version.id,
                              versionName: version.name,
                              versionPublisher: version.publishers?.join(', ') || '',
                              versionLanguage: version.languages?.join(', ') || '',
                              versionYear: version.yearpublished,
                              versionProductCode: version.productcode,
                            }))
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="text-sm border-warm-yellow/30 focus:border-vibrant-orange">
                        <SelectValue placeholder="Select a specific version/edition" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value="main-game">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-dark-green" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">Choose version</div>
                              <div className="text-xs text-gray-500">
                                {selectedBGGGame?.versions && selectedBGGGame.versions.length > 0 
                                  ? `${selectedBGGGame.versions.length} versions available`
                                  : 'No versions found'
                                }
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        {selectedBGGGame?.versions?.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded">
                                {version.thumbnail ? (
                                  <Image
                                    src={version.thumbnail}
                                    alt={version.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full bg-light-beige rounded flex items-center justify-center ${version.thumbnail ? 'hidden' : ''}`}>
                                  <Package className="w-4 h-4 text-dark-green" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-medium text-sm truncate">
                                  {version.name} ({version.yearpublished})
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>


                  </div>
                

                {/* Title Selection */}
                <div className="space-y-2">
                  <Select
                    value={selectedTitleVariant}
                    onValueChange={(value) => {
                      setSelectedTitleVariant(value)
                      if (value === "main-title") {
                        setFormData(prev => ({ ...prev, title: selectedBGGGame?.name || 'Unknown Game' }))
                      } else {
                        setFormData(prev => ({ ...prev, title: value }))
                      }
                    }}
                  >
                    <SelectTrigger className="text-sm border-warm-yellow/30 focus:border-vibrant-orange">
                      <SelectValue placeholder="Choose title" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="main-title">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                            <Type className="w-4 h-4 text-dark-green" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{selectedBGGGame?.name || 'Unknown Game'}</div>
                            <div className="text-xs text-gray-500">
                              {selectedBGGGame?.alternateNames && selectedBGGGame.alternateNames.length > 0 
                                ? `${selectedBGGGame.alternateNames.length} alternative titles available`
                                : 'Primary title'
                              }
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      {selectedBGGGame?.alternateNames && selectedBGGGame?.alternateNames.map((altName, index) => (
                        <SelectItem key={`${selectedBGGGame?.id}-alt-${index}`} value={altName}>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                                <Type className="w-4 h-4 text-dark-green" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-sm truncate">
                                {altName}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expansions Section */}
                {formData.listingType === "base-game" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-dark-green">Add Expansions & Promos</Label>
                      <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">Premium Feature</Badge>
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

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep} size="sm" className="text-sm border-warm-yellow text-dark-green hover:bg-warm-yellow/10">
                    Back
                  </Button>
                  <Button onClick={handleNextStep} className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* BGG Logo */}
            <div className="flex justify-center mt-6">
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
          </>
        )}

        {currentStep === 'listing-details' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-green text-lg lg:text-xl">Listing Details</CardTitle>
                <CardDescription className="text-sm">Configure your listing details</CardDescription>
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
            
            {/* BGG Logo */}
            <div className="flex justify-center mt-6">
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
          </>
        )}
      </div>
    </div>
  )
}
