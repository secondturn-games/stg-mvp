"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Euro, Gavel, ExternalLink, Package, Calendar, Users, Cake, Clock, Type, Camera, MapPin, Truck, Star, Upload, X, ChevronDown, ChevronUp, Eye, Heart, MessageCircle, Shield, Gift, RefreshCw } from "lucide-react"
import { Navigation } from "@/components/navigation"

// Utility class for screen reader only content
const srOnly = "sr-only"

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
  localArea: string
  includedItems: string[]
  extrasCategories: string[]
  extrasNotes: string
  photos: File[]
  shippingMethods: string[]
  shippingCosts: { [key: string]: string }
  tradingOptions: string[]
  listingType: "base-game" | "expansion" | "bundle"
  saleType: "fixed-price" | "auction"
  baseGame: string
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

// Type guards for runtime safety
const isValidBGGSearchResult = (data: unknown): data is BGGSearchResult => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  )
}

const isValidBGGGameDetails = (data: unknown): data is BGGGameDetails => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'yearpublished' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).yearpublished === 'string'
  )
}

const isValidBGGGameVersion = (data: unknown): data is BGGGameVersion => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  )
}

// Predefined categories for game conditions
const CONDITION_OPTIONS = [
  { value: "new-in-shrink", label: "New in Shrink", description: "Brand new, never opened, still in original shrink wrap" },
  { value: "like-new", label: "Like New", description: "Opened but never played, components like new" },
  { value: "excellent", label: "Excellent", description: "Played but very well maintained, minimal wear" },
  { value: "good", label: "Good", description: "Some visible wear, all components present and functional" },
  { value: "fair", label: "Fair", description: "Noticeable wear, may have minor damage but fully playable" },
  { value: "poor", label: "Poor", description: "Significant wear or damage, missing pieces possible" }
]

// Predefined categories for extras/add-ons
const EXTRAS_OPTIONS = [
  "Sleeved Cards",
  "Painted Miniatures", 
  "Custom Organizer/Insert",
  "Upgraded Components",
  "Metal Coins",
  "Wooden Tokens",
  "Playmat Included",
  "Storage Solution",
  "Extra Dice",
  "Promo Cards/Items"
]

// Predefined shipping methods
const SHIPPING_OPTIONS = [
  { value: "local-pickup", label: "Local Pickup", description: "Meet in person" },
  { value: "national-standard", label: "National Standard", description: "5-7 business days" },
  { value: "national-express", label: "National Express", description: "1-3 business days" },
  { value: "eu-standard", label: "EU Standard", description: "7-14 business days" },
  { value: "eu-express", label: "EU Express", description: "3-7 business days" },
  { value: "worldwide", label: "Worldwide", description: "14-30 business days" }
]

export default function ListGamePage() {
  const [currentStep, setCurrentStep] = useState<'sale-type' | 'search' | 'game-details' | 'listing-details'>('sale-type')

  const [searchTerm, setSearchTerm] = useState("")
  
  // Collapsible sections state for Step 4
  const [expandedSections, setExpandedSections] = useState({
    extras: false,
    photos: false,
    conditionDetails: false,
    mobilePreview: false
  })

  // Touch/swipe navigation state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedBGGGame, setSelectedBGGGame] = useState<BGGGameDetails | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<BGGGameVersion | null>(null)
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>("main-title")
  const [currentGameType, setCurrentGameType] = useState<'base-game' | 'expansion'>('base-game')

  // Centralized error handling
  const handleError = (error: unknown, context: string, fallbackMessage?: string) => {
    // Don't handle abort errors (user cancelled)
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    
    const message = error instanceof Error ? error.message : (fallbackMessage || `${context} failed`)
    setSearchError(message)
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`${context} error:`, error)
    }
  }


  // Abort controller for cancelling previous requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Helper function to toggle collapsible sections
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Swipe navigation logic
  const minSwipeDistance = 50 // Minimum distance for a swipe to register

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwipeActive(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    setIsSwipeActive(false)
    
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && canSwipeNext()) {
      handleNextStep()
    }
    if (isRightSwipe && canSwipeBack()) {
      handleBackStep()
    }
  }

  // Check if we can swipe to next step
  const canSwipeNext = () => {
    switch (currentStep) {
      case 'sale-type':
        return !!formData.saleType
      case 'search':
        return !!selectedBGGGame
      case 'game-details':
        return !!(formData.players && formData.playtime && formData.age && formData.versionName)
      case 'listing-details':
        return false // Last step, no next
      default:
        return false
    }
  }

  // Check if we can swipe back
  const canSwipeBack = () => {
    return currentStep !== 'sale-type' // Can't go back from first step
  }

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
    localArea: "",
    includedItems: [],
    extrasCategories: [],
    extrasNotes: "",
    photos: [],
    shippingMethods: [],
    shippingCosts: {},
    tradingOptions: [],
    listingType: "base-game",
    saleType: "fixed-price",
    baseGame: "",
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
    const gameTypeToUse = customGameType || currentGameType


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
      handleError(error, 'Search', 'Search failed. Please try again.')
    } finally {
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
      return
    }

    // If it's already a BGGGameDetails object (has versions), use it directly
    if ('versions' in game && isValidBGGGameDetails(game)) {
      setSelectedBGGGame(game)
      setSelectedVersion(null)
      setSelectedTitleVariant("main-title")
      
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
      const response = await fetch(`/api/bgg/game/${game.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch game details: ${response.status}`)
      }
      
      const responseData = await response.json()
      
      if (!responseData.game || !isValidBGGGameDetails(responseData.game)) {
        throw new Error('Invalid game data received from server')
      }
      
      const gameDetails: BGGGameDetails = responseData.game
      
      setSelectedBGGGame(gameDetails)
      setSelectedVersion(null)
      setSelectedTitleVariant("main-title")
      
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
      handleError(error, 'Game details fetch', 'Failed to fetch game details')
      
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

  // Function to handle direct step navigation
  const handleStepClick = (step: 'sale-type' | 'search' | 'game-details' | 'listing-details') => {
    // Allow navigation to any completed step or the current step
    if (step === 'sale-type') {
      setCurrentStep(step)
    } else if (step === 'search' && formData.saleType) {
      setCurrentStep(step)
    } else if (step === 'game-details' && formData.saleType && selectedBGGGame) {
      setCurrentStep(step)
    } else if (step === 'listing-details' && formData.saleType && selectedBGGGame) {
      setCurrentStep(step)
    }
  }

  // Helper function to determine if a step is clickable
  const isStepClickable = (step: 'sale-type' | 'search' | 'game-details' | 'listing-details') => {
    if (step === 'sale-type') return true
    if (step === 'search') return !!formData.saleType
    if (step === 'game-details') return !!formData.saleType && !!selectedBGGGame
    if (step === 'listing-details') return !!formData.saleType && !!selectedBGGGame
    return false
  }

  // Helper function to check if preview should be shown
  const canShowPreview = () => {
    return !!(
      formData.saleType &&
      selectedBGGGame &&
      (currentStep === 'listing-details' || currentStep === 'game-details')
    )
  }

  // Helper function to get condition label
  const getConditionLabel = (condition: string) => {
    const option = CONDITION_OPTIONS.find(opt => opt.value === condition)
    return option ? option.label : condition
  }

  // Helper function to get shipping method labels
  const getShippingMethodLabels = (methods: string[]) => {
    return methods.map(method => {
      const option = SHIPPING_OPTIONS.find(opt => opt.value === method)
      return option ? option.label : method
    })
  }

  // Memoized computed values for performance
  const hasValidSearchTerm = useMemo(() => {
    return searchTerm.trim().length >= 2
  }, [searchTerm])

  const canPerformSearch = useMemo(() => {
    return hasValidSearchTerm && !isSearching
  }, [hasValidSearchTerm, isSearching])

  return (
    <div className="min-h-screen bg-light-beige">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">


        {/* Step Indicator */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Step 1: Listing Type */}
              <div 
                className={`flex items-center ${
                  currentStep === 'sale-type' ? 'text-vibrant-orange' : 'text-gray-400'
                } ${isStepClickable('sale-type') ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isStepClickable('sale-type') && handleStepClick('sale-type')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === 'sale-type' 
                    ? 'bg-vibrant-orange text-white' 
                    : isStepClickable('sale-type')
                      ? 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Listing Type</span>
              </div>
              
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'search' || currentStep === 'game-details' || currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              
              {/* Step 2: Find Game */}
              <div 
                className={`flex items-center ${
                  currentStep === 'search' 
                    ? 'text-vibrant-orange' 
                    : currentStep === 'game-details' || currentStep === 'listing-details' 
                      ? 'text-gray-600' 
                      : 'text-gray-400'
                } ${isStepClickable('search') ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isStepClickable('search') && handleStepClick('search')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === 'search' 
                    ? 'bg-vibrant-orange text-white' 
                    : currentStep === 'game-details' || currentStep === 'listing-details' 
                      ? isStepClickable('search')
                        ? 'bg-gray-300 hover:bg-gray-400 text-white'
                        : 'bg-gray-300'
                      : isStepClickable('search')
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Find Game</span>
              </div>
              
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'game-details' || currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              
              {/* Step 3: Game Details */}
              <div 
                className={`flex items-center ${
                  currentStep === 'game-details' 
                    ? 'text-vibrant-orange' 
                    : currentStep === 'listing-details' 
                      ? 'text-gray-600' 
                      : 'text-gray-400'
                } ${isStepClickable('game-details') ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isStepClickable('game-details') && handleStepClick('game-details')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === 'game-details' 
                    ? 'bg-vibrant-orange text-white' 
                    : currentStep === 'listing-details' 
                      ? isStepClickable('game-details')
                        ? 'bg-gray-300 hover:bg-gray-400 text-white'
                        : 'bg-gray-300'
                      : isStepClickable('game-details')
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Game Details</span>
              </div>
              
              <div className={`w-4 lg:w-8 h-1 ${currentStep === 'listing-details' ? 'bg-vibrant-orange' : 'bg-gray-200'}`}></div>
              
              {/* Step 4: Listing Details */}
              <div 
                className={`flex items-center ${
                  currentStep === 'listing-details' ? 'text-vibrant-orange' : 'text-gray-400'
                } ${isStepClickable('listing-details') ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isStepClickable('listing-details') && handleStepClick('listing-details')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === 'listing-details' 
                    ? 'bg-vibrant-orange text-white' 
                    : isStepClickable('listing-details')
                      ? 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-gray-200'
                }`}>
                  4
                </div>
                <span className="ml-2 text-sm hidden lg:inline">Listing Details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div 
          className={`lg:flex lg:gap-8 transition-transform duration-75 ${
            isSwipeActive ? 'scale-[0.99]' : 'scale-100'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Left Column - Form Content */}
          <div className="lg:flex-1 lg:max-w-4xl">
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
                  <Card 
                    className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5 hover:bg-warm-yellow/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, saleType: 'fixed-price' }))
                      handleNextStep()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setFormData(prev => ({ ...prev, saleType: 'fixed-price' }))
                        handleNextStep()
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Select Fixed Price listing type"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                          <Euro className="w-6 h-6 text-vibrant-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark-green">Fixed Price</h3>
                          <p className="text-sm text-gray-600">You set the price</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 cursor-not-allowed opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-500">More Ways to List</h3>
                        <Badge variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">Coming Soon</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-200 rounded">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Bundle</div>
                            <div className="text-xs text-gray-400">Sell more together</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-200 rounded">
                            <Gavel className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Auction</div>
                            <div className="text-xs text-gray-400">Let community decide</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-200 rounded">
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Trade / Swap</div>
                            <div className="text-xs text-gray-400">Game for game</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-200 rounded relative">
                            <Gift className="w-4 h-4 text-gray-400" />
                            <Heart className="w-2 h-2 text-gray-400 absolute -top-0.5 -right-0.5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Giveaway</div>
                            <div className="text-xs text-gray-400">Pass it forward</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                <CardDescription className="text-sm">Choose whether you’re looking for a Base Game or an Expansion, and we’ll pull in the official details from BGG</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {/* Game Type Switch */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setCurrentGameType('base-game')
                        // Clear results when switching filters
                        setSearchResults([])
                        setSearchError('')
                        // Auto-search if there's a search term
                        if (hasValidSearchTerm) {
                          performSearch('base-game')
                        }
                      }}
                      aria-label="Search for base games"
                      aria-pressed={currentGameType === 'base-game'}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        currentGameType === 'base-game'
                          ? 'bg-vibrant-orange text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Base Game
                    </button>
                    <button
                      onClick={() => {
                        setCurrentGameType('expansion')
                        // Clear results when switching filters
                        setSearchResults([])
                        setSearchError('')
                        // Auto-search if there's a search term
                        if (hasValidSearchTerm) {
                          performSearch('expansion')
                        }
                      }}
                      aria-label="Search for expansions"
                      aria-pressed={currentGameType === 'expansion'}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        currentGameType === 'expansion'
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
                        aria-label="Search for games"
                        aria-describedby="search-help"
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
                      <div id="search-help" className="sr-only">
                      Type the game name (at least 2 letters)
                      </div>
                      
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
                      disabled={!canPerformSearch}
                      aria-label={isSearching ? "Searching for games" : "Search for games"}
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

                {searchTerm.trim().length > 0 && !hasValidSearchTerm && !isSearching && (
                  <div className="p-3 bg-light-green/50 border border-light-green rounded-lg">
                    <p className="text-sm lg:text-base text-dark-green">
                      💡 Type the game name (at least 2 letters)
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
                  <Button 
                    variant="outline" 
                    onClick={handleBackStep} 
                    size="sm" 
                    className="text-sm border-warm-yellow text-dark-green hover:bg-warm-yellow/10"
                    aria-label="Go back to previous step"
                  >
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
                      <SelectContent className="max-h-80 md:max-h-80 max-h-[28rem] overflow-y-auto">
                        <SelectItem value="main-game" className="min-h-[3rem]">
                          <div className="flex items-center space-x-3 py-1">
                            <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-dark-green" />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-medium text-sm leading-tight">Which version do you have?</div>
                              <div className="text-xs text-gray-500 leading-tight">
                                {selectedBGGGame?.versions && selectedBGGGame.versions.length > 0 
                                  ? `${selectedBGGGame.versions.length} versions available`
                                  : 'No versions found'
                                }
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        {selectedBGGGame?.versions
                          ?.filter(version => version.name && version.name.trim() !== '')
                          ?.map((version, index) => (
                          <SelectItem key={`${version.id}-${index}`} value={version.id} className="min-h-[3rem]">
                            <div className="flex items-center space-x-3 py-1">
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
                                <div className="font-medium text-sm truncate leading-tight">
                                  {version.name} {version.yearpublished ? `(${version.yearpublished})` : ''}
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
                    <SelectContent className="max-h-80 md:max-h-80 max-h-[28rem] overflow-y-auto">
                      <SelectItem value="main-title" className="min-h-[3rem]">
                        <div className="flex items-center space-x-3 py-1">
                          <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center flex-shrink-0">
                            <Type className="w-4 h-4 text-dark-green" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-sm truncate leading-tight">{selectedBGGGame?.name || 'Unknown Game'}</div>
                            <div className="text-xs text-gray-500 leading-tight">
                              {selectedBGGGame?.alternateNames && selectedBGGGame.alternateNames.length > 0 
                                ? `${selectedBGGGame.alternateNames.length} alternative titles available`
                                : 'Primary title'
                              }
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      {selectedBGGGame?.alternateNames && selectedBGGGame?.alternateNames.map((altName, index) => (
                        <SelectItem key={`${selectedBGGGame?.id}-alt-${index}`} value={altName} className="min-h-[3rem]">
                          <div className="flex items-center space-x-3 py-1">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-light-beige rounded flex items-center justify-center">
                                <Type className="w-4 h-4 text-dark-green" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-sm truncate leading-tight">
                                {altName}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBackStep} 
                    size="sm" 
                    className="text-sm border-warm-yellow text-dark-green hover:bg-warm-yellow/10"
                    aria-label="Go back to search step"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm"
                    aria-label="Continue to listing details"
                  >
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
                <CardDescription className="text-sm">Set your price, condition, and photos to complete your listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Game Condition Section - Required */}
                <Card className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5 hover:bg-warm-yellow/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                        <Star className="w-4 h-4 text-vibrant-orange" />
                      </div>
                      <Label className="text-sm font-medium text-dark-green">Game Condition *</Label>
                    </div>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-vibrant-orange">
                        <SelectValue placeholder="Select condition..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Collapsible Additional Condition Details */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleSection('conditionDetails')}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-vibrant-orange transition-colors p-2 -m-2 rounded"
                      >
                        {expandedSections.conditionDetails ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>Add condition details (optional)</span>
                      </button>
                      {expandedSections.conditionDetails && (
                        <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                          <textarea
                            id="condition-notes"
                            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                            rows={3}
                            placeholder="Describe any missing pieces, damage, or other condition details..."
                            value={formData.conditionNotes}
                            onChange={(e) => setFormData(prev => ({ ...prev, conditionNotes: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Section - Required */}
                <Card className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5 hover:bg-warm-yellow/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                        <Euro className="w-4 h-4 text-vibrant-orange" />
                      </div>
                      <Label htmlFor="price" className="text-sm font-medium text-dark-green">Game Price (EUR) *</Label>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="25.00"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Methods Section - Required */}
                <Card className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5 hover:bg-warm-yellow/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                        <Truck className="w-4 h-4 text-vibrant-orange" />
                      </div>
                      <Label className="text-sm font-medium text-dark-green">Shipping Options *</Label>
                    </div>
                    <div className="space-y-3">
                      {SHIPPING_OPTIONS.map((option) => (
                        <div 
                          key={option.value} 
                          className={`border rounded-lg p-3 transition-colors ${
                            formData.shippingMethods.includes(option.value)
                              ? 'border-vibrant-orange bg-warm-yellow/10'
                              : 'border-gray-200 hover:border-vibrant-orange/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={formData.shippingMethods.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      shippingMethods: [...prev.shippingMethods, option.value],
                                      shippingCosts: { ...prev.shippingCosts, [option.value]: '0.00' }
                                    }))
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      shippingMethods: prev.shippingMethods.filter(m => m !== option.value),
                                      shippingCosts: Object.fromEntries(
                                        Object.entries(prev.shippingCosts).filter(([key]) => key !== option.value)
                                      )
                                    }))
                                  }
                                }}
                                className="rounded border-gray-300 text-vibrant-orange focus:ring-vibrant-orange"
                              />
                              <div>
                                <div className="font-medium text-sm">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </label>
                            {formData.shippingMethods.includes(option.value) && (
                              <div className="flex items-center space-x-2">
                                <Euro className="w-3 h-3 text-gray-400" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={formData.shippingCosts[option.value] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    shippingCosts: { ...prev.shippingCosts, [option.value]: e.target.value }
                                  }))}
                                  className="w-20 text-sm border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Section - Required */}
                <Card className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5 hover:bg-warm-yellow/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                        <MapPin className="w-4 h-4 text-vibrant-orange" />
                      </div>
                      <Label className="text-sm font-medium text-dark-green">Your Location *</Label>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="country" className="text-sm text-gray-600">Country</Label>
                        <Input
                          id="country"
                          placeholder="Germany"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm text-gray-600">City</Label>
                        <Input
                          id="city"
                          placeholder="Berlin"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="local-area" className="text-sm text-gray-600">Local Area</Label>
                        <Input
                          id="local-area"
                          placeholder="Mitte, Kreuzberg..."
                          value={formData.localArea}
                          onChange={(e) => setFormData(prev => ({ ...prev, localArea: e.target.value }))}
                          className="border-gray-300 focus:border-vibrant-orange focus:ring-1 focus:ring-vibrant-orange"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collapsible Extras & Add-ons Section */}
                <Card className={`transition-all duration-200 cursor-pointer ${
                  expandedSections.extras || formData.extrasCategories.length > 0
                    ? 'border-l-4 border-l-light-green bg-light-green/5 hover:bg-light-green/10'
                    : 'border border-gray-200 hover:border-light-green/50 hover:bg-light-green/5'
                }`}>
                  <CardContent className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleSection('extras')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-light-green/10 rounded-lg">
                          <Plus className="w-4 h-4 text-light-green" />
                        </div>
                        <Label className="text-sm font-medium text-dark-green cursor-pointer">
                          Extras & Add-ons (optional)
                        </Label>
                        {formData.extrasCategories.length > 0 && (
                          <Badge variant="outline" className="text-xs border-light-green text-light-green">
                            {formData.extrasCategories.length} selected
                          </Badge>
                        )}
                      </div>
                      {expandedSections.extras ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 hover:text-light-green transition-colors" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 hover:text-light-green transition-colors" />
                      )}
                    </button>
                  
                    {expandedSections.extras && (
                      <div className="mt-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {EXTRAS_OPTIONS.map((extra) => (
                            <label
                              key={extra}
                              className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                                formData.extrasCategories.includes(extra)
                                  ? 'border-light-green bg-light-green/10'
                                  : 'border-gray-200 hover:border-light-green/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.extrasCategories.includes(extra)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      extrasCategories: [...prev.extrasCategories, extra]
                                    }))
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      extrasCategories: prev.extrasCategories.filter(item => item !== extra)
                                    }))
                                  }
                                }}
                                className="rounded border-gray-300 text-light-green focus:ring-light-green"
                              />
                              <span>{extra}</span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <Label htmlFor="extras-notes" className="text-sm text-gray-600">
                            Other extras or special features
                          </Label>
                          <textarea
                            id="extras-notes"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md text-sm focus:border-light-green focus:ring-1 focus:ring-light-green"
                            rows={2}
                            placeholder="Describe any other extras, upgrades, or special features..."
                            value={formData.extrasNotes}
                            onChange={(e) => setFormData(prev => ({ ...prev, extrasNotes: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Collapsible Photos Section */}
                <Card className={`transition-all duration-200 cursor-pointer ${
                  expandedSections.photos || formData.photos.length > 0
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50/70'
                    : 'border border-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30'
                }`}>
                  <CardContent className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleSection('photos')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Camera className="w-4 h-4 text-blue-500" />
                        </div>
                        <Label className="text-sm font-medium text-dark-green cursor-pointer">
                          Photos (optional, max 3)
                        </Label>
                        {formData.photos.length > 0 && (
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                            {formData.photos.length} uploaded
                          </Badge>
                        )}
                      </div>
                      {expandedSections.photos ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                      )}
                    </button>
                    
                    {expandedSections.photos && (
                      <div className="mt-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload photos</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                        </div>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024) // 5MB limit
                            const newPhotos = [...formData.photos, ...validFiles].slice(0, 3) // Max 3 photos
                            setFormData(prev => ({ ...prev, photos: newPhotos }))
                          }}
                        />
                        {formData.photos.length > 0 && (
                          <div className="flex space-x-2">
                            {formData.photos.map((photo, index) => (
                              <div key={index} className="relative">
                                <div className="w-20 h-20 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-blue-400" />
                                </div>
                                <button
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      photos: prev.photos.filter((_, i) => i !== index)
                                    }))
                                  }}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <p className="text-xs text-gray-500 mt-1 text-center truncate">{photo.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBackStep} 
                    size="sm" 
                    className="text-sm border-warm-yellow text-dark-green hover:bg-warm-yellow/10"
                    aria-label="Go back to game details step"
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-sm"
                    disabled={!formData.condition || !formData.price || formData.shippingMethods.length === 0 || !formData.country}
                  >
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

          {/* Right Column - Listing Preview Sidebar */}
          {canShowPreview() && (
            <div className="lg:w-96 lg:flex-shrink-0">
              {/* Mobile Preview Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setExpandedSections(prev => ({ ...prev, mobilePreview: !prev.mobilePreview }))}
                  className="w-full flex items-center justify-between border-vibrant-orange text-vibrant-orange hover:bg-vibrant-orange/10"
                >
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Preview Listing</span>
                  </div>
                  {expandedSections.mobilePreview ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Preview Content */}
              <div className={`${!expandedSections.mobilePreview ? 'hidden' : 'block'} lg:block`}>
                <div className="lg:sticky lg:top-8">
                  <Card className="border-2 border-vibrant-orange bg-gradient-to-r from-warm-yellow/10 to-warm-beige/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                          <Eye className="w-4 h-4 text-vibrant-orange" />
                        </div>
                        <div>
                          <CardTitle className="text-dark-green text-base">Listing Preview</CardTitle>
                          <CardDescription className="text-xs">
                            {currentStep === 'game-details' ? 'Add details in Step 4 to enhance' : 'Live preview'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Preview Content */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex items-start space-x-3 mb-3">
                          {selectedBGGGame?.thumbnail && (
                            <div className="flex-shrink-0">
                              <Image
                                src={selectedBGGGame.thumbnail}
                                alt={selectedBGGGame.name}
                                width={60}
                                height={60}
                                className="rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-dark-green leading-tight mb-1">
                              {selectedBGGGame?.name}
                            </h3>
                            {formData.versionName && formData.versionName !== selectedBGGGame?.name && (
                              <p className="text-xs text-gray-600 mb-2">{formData.versionName}</p>
                            )}
                            
                            {/* Compact game stats */}
                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                              {selectedBGGGame?.yearpublished && (
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 text-vibrant-orange" />
                                  <span>{selectedBGGGame.yearpublished}</span>
                                </div>
                              )}
                              {formData.players && (
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1 text-vibrant-orange" />
                                  <span>{formData.players}p</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price section */}
                        <div className="text-center mb-3 p-2 bg-gray-50 rounded">
                          {formData.price ? (
                            <div className="text-xl font-bold text-vibrant-orange">€{formData.price}</div>
                          ) : (
                            <div className="text-sm text-gray-400">Add price in Step 4</div>
                          )}
                          {formData.condition && (
                            <div className="text-xs text-gray-500">{getConditionLabel(formData.condition)}</div>
                          )}
                        </div>

                        {/* Compact details */}
                        <div className="space-y-2 text-xs">
                          {formData.condition && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Star className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span className="font-medium text-dark-green">Condition</span>
                              </div>
                              <div className="text-gray-600 ml-4">{getConditionLabel(formData.condition)}</div>
                              {formData.conditionNotes && (
                                <div className="text-gray-500 ml-4 truncate">{formData.conditionNotes}</div>
                              )}
                            </div>
                          )}

                          {formData.extrasCategories.length > 0 && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Plus className="w-3 h-3 mr-1 text-light-green" />
                                <span className="font-medium text-dark-green">Extras</span>
                              </div>
                              <div className="ml-4 flex flex-wrap gap-1">
                                {formData.extrasCategories.slice(0, 3).map((extra) => (
                                  <Badge key={extra} variant="outline" className="text-xs border-light-green text-light-green px-1 py-0">
                                    {extra}
                                  </Badge>
                                ))}
                                {formData.extrasCategories.length > 3 && (
                                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 px-1 py-0">
                                    +{formData.extrasCategories.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {formData.photos.length > 0 && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Camera className="w-3 h-3 mr-1 text-blue-500" />
                                <span className="font-medium text-dark-green">Photos ({formData.photos.length})</span>
                              </div>
                              <div className="ml-4 flex space-x-1">
                                {formData.photos.slice(0, 4).map((photo, index) => (
                                  <div key={index} className="w-6 h-6 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                                    <Camera className="w-3 h-3 text-blue-400" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.shippingMethods.length > 0 && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Truck className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span className="font-medium text-dark-green">Shipping</span>
                              </div>
                              <div className="ml-4 space-y-1">
                                {getShippingMethodLabels(formData.shippingMethods).slice(0, 2).map((label, index) => (
                                  <div key={label} className="flex justify-between text-gray-600">
                                    <span className="truncate">{label}</span>
                                    <span>€{formData.shippingCosts[formData.shippingMethods[index]] || '0.00'}</span>
                                  </div>
                                ))}
                                {formData.shippingMethods.length > 2 && (
                                  <div className="text-gray-500">+{formData.shippingMethods.length - 2} more options</div>
                                )}
                              </div>
                            </div>
                          )}

                          {(formData.country || formData.city) && (
                            <div>
                              <div className="flex items-center mb-1">
                                <MapPin className="w-3 h-3 mr-1 text-vibrant-orange" />
                                <span className="font-medium text-dark-green">Location</span>
                              </div>
                              <div className="ml-4 text-gray-600">
                                {formData.country}{formData.city && `, ${formData.city}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

