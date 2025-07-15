'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import { getUserLocale } from '@/lib/regional-settings'
import { Eye, X } from 'lucide-react'

interface ListingFormData {
  gameTitle: string
  gameId: string | null
  listingType: 'fixed' | 'auction' | 'trade'
  price: string
  currency: 'EUR'
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
  locationCity: string
  description: string
  images: string[]
  photos?: string[]
  shippingOptions: {
    omniva: boolean
    dpd: boolean
    pickup: boolean
  }
  // Auction-specific fields
  startingPrice: string
  auctionDays: string
  endTime: string
  reservePrice: string
  buyNowPrice: string
  bidIncrement: string
}

interface GameSuggestion {
  id: string
  title: Record<string, string>
}

interface ListingFormProps {
  mode?: 'create' | 'edit'
  initialValues?: Partial<ListingFormData>
}

const defaultFormData: ListingFormData = {
  gameTitle: '',
  gameId: null,
  listingType: 'fixed',
  price: '',
  currency: 'EUR',
  condition: 'very_good',
  locationCity: '',
  description: '',
  images: [],
  shippingOptions: {
    omniva: true,
    dpd: true,
    pickup: true
  },
  startingPrice: '',
  auctionDays: '1',
  endTime: '',
  reservePrice: '',
  buyNowPrice: '',
  bidIncrement: '1.00'
}

const ListingForm: FC<ListingFormProps> = ({ mode = 'create', initialValues }) => {
  const router = useRouter()
  const locale = getUserLocale()
  
  const [formData, setFormData] = useState<ListingFormData>(() => {
    if (mode === 'edit' && initialValues) {
      return {
        ...defaultFormData,
        ...initialValues,
        shippingOptions: {
          ...defaultFormData.shippingOptions,
          ...initialValues.shippingOptions
        },
        images: initialValues.images || initialValues.photos || []
      }
    }
    return defaultFormData
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [gameSuggestions, setGameSuggestions] = useState<GameSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch game suggestions
  useEffect(() => {
    const fetchGameSuggestions = async () => {
      if (formData.gameTitle.length < 2) {
        setGameSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(formData.gameTitle)}`)
        if (response.ok) {
          const data = await response.json()
          setGameSuggestions(data.games || [])
        }
      } catch (error) {
        console.error('Error fetching game suggestions:', error)
      }
    }

    const debounceTimer = setTimeout(fetchGameSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [formData.gameTitle])

  // Validate 24-hour time format
  const validateTimeFormat = (timeString: string) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(timeString)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: 'Listing created successfully!' })
        // Redirect to the appropriate page based on listing type
        setTimeout(() => {
          if (result.listingType === 'auction') {
            router.push(`/auctions/${result.listing.id}`)
          } else {
            router.push(`/listings/${result.listing.id}`)
          }
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to create listing' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating your listing' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Show suggestions when typing in game title
    if (name === 'gameTitle') {
      setShowSuggestions(true)
    }
  }

  const handleGameSuggestionClick = (suggestion: GameSuggestion) => {
    setFormData(prev => ({
      ...prev,
      gameTitle: suggestion.title.en || suggestion.title.et || Object.values(suggestion.title)[0],
      gameId: suggestion.id
    }))
    setShowSuggestions(false)
  }

  const handleShippingChange = (option: keyof typeof formData.shippingOptions) => {
    setFormData(prev => ({
      ...prev,
      shippingOptions: {
        ...prev.shippingOptions,
        [option]: !prev.shippingOptions[option]
      }
    }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }))
  }

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new': return 'New (Sealed)'
      case 'like_new': return 'Like New'
      case 'very_good': return 'Very Good'
      case 'good': return 'Good'
      case 'acceptable': return 'Acceptable'
      default: return condition
    }
  }

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'Fixed Price'
      case 'auction': return 'Auction'
      case 'trade': return 'Trade Only'
      default: return type
    }
  }

  const formatPrice = (price: string) => {
    if (!price) return 'Trade Only'
    return `${parseFloat(price).toFixed(2)} EUR`
  }

  const calculateAuctionEndTime = () => {
    if (!formData.auctionDays || !formData.endTime || !validateTimeFormat(formData.endTime)) {
      return null
    }
    const now = new Date()
    const [hours, minutes] = formData.endTime.split(':').map(Number)
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + parseInt(formData.auctionDays))
    endDate.setHours(hours, minutes, 0, 0)
    return endDate
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Game Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Game Information</h3>
        
        <div>
          <label htmlFor="gameTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Game Title *
          </label>
          <input
            type="text"
            id="gameTitle"
            name="gameTitle"
            value={formData.gameTitle}
            onChange={handleChange}
            required
            placeholder="e.g., Catan, Ticket to Ride"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {showSuggestions && gameSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
              {gameSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleGameSuggestionClick(suggestion)}
                >
                  {suggestion.title.en || suggestion.title.et || Object.values(suggestion.title)[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-2">
            Listing Type *
          </label>
          <select
            id="listingType"
            name="listingType"
            value={formData.listingType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fixed">Fixed Price</option>
            <option value="auction">Auction</option>
            <option value="trade">Trade Only</option>
          </select>
        </div>

        {formData.listingType === 'fixed' && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (EUR) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="25.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {formData.listingType === 'auction' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price (EUR) *
                </label>
                <input
                  type="number"
                  id="startingPrice"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="10.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="auctionDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Duration (Days) *
                </label>
                <input
                  type="number"
                  id="auctionDays"
                  name="auctionDays"
                  value={formData.auctionDays}
                  onChange={handleChange}
                  required
                  min="1"
                  max="30"
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many days should the auction run? (1-30 days)
                </p>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time (24h format) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    placeholder="14:30"
                    pattern="[0-9]{1,2}:[0-9]{2}"
                    maxLength={5}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                    24h
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  What time should the auction end? Use 24-hour format (e.g., 14:30 for 2:30 PM)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Current time: {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                
                {/* Auction End Time Preview */}
                {formData.auctionDays && formData.endTime && validateTimeFormat(formData.endTime) && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <span className="font-medium text-green-800">Auction will end:</span>
                    <div className="text-green-700">
                      {(() => {
                        const now = new Date()
                        const [hours, minutes] = formData.endTime.split(':').map(Number)
                        const endDate = new Date(now)
                        endDate.setDate(endDate.getDate() + parseInt(formData.auctionDays))
                        endDate.setHours(hours, minutes, 0, 0)
                        return endDate.toLocaleString(locale, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="reservePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price (EUR)
                </label>
                <input
                  type="number"
                  id="reservePrice"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="buyNowPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Now Price (EUR)
                </label>
                <input
                  type="number"
                  id="buyNowPrice"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bidIncrement" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Bid Increment (EUR)
                </label>
                <input
                  type="number"
                  id="bidIncrement"
                  name="bidIncrement"
                  value={formData.bidIncrement}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="1.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Auction Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Set a reasonable starting price to attract bidders</li>
                <li>• Choose auction duration (1-30 days)</li>
                <li>• Set end time in 24-hour format (e.g., 14:30 for 2:30 PM)</li>
                <li>• Reserve price is optional but protects your minimum price</li>
                <li>• Buy Now price allows instant purchase</li>
                <li>• Auctions automatically extend if bids are placed near the end</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Condition and Location */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="new">New (Sealed)</option>
            <option value="like_new">Like New</option>
            <option value="very_good">Very Good</option>
            <option value="good">Good</option>
            <option value="acceptable">Acceptable</option>
          </select>
        </div>

        <div>
          <label htmlFor="locationCity" className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            id="locationCity"
            name="locationCity"
            value={formData.locationCity}
            onChange={handleChange}
            required
            placeholder="e.g., Tallinn, Riga, Vilnius"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe the game, its components, any damage, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Images</h4>
        <ImageUpload 
          onImagesChange={handleImagesChange}
          maxImages={6}
        />
      </div>

      {/* Shipping Options */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Shipping Options</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.shippingOptions.omniva}
              onChange={() => handleShippingChange('omniva')}
              className="mr-2"
            />
            <span className="text-sm">Omniva Parcel Machine</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.shippingOptions.dpd}
              onChange={() => handleShippingChange('dpd')}
              className="mr-2"
            />
            <span className="text-sm">DPD Pickup Point</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.shippingOptions.pickup}
              onChange={() => handleShippingChange('pickup')}
              className="mr-2"
            />
            <span className="text-sm">Local Pickup</span>
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!formData.gameTitle || !formData.description}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview Listing
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating Listing...' : 'Create Listing'}
        </button>
      </div>
    </form>

    {/* Preview Modal */}
    {showPreview && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Listing Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Game Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {formData.images && formData.images.length > 0 ? (
                <img
                  src={formData.images[0]}
                  alt={formData.gameTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎲</div>
                    <div className="text-gray-500">No Image</div>
                  </div>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{formData.gameTitle}</h1>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">
                  {formData.listingType === 'fixed' 
                    ? formatPrice(formData.price)
                    : formData.listingType === 'auction'
                    ? `Starting: ${formatPrice(formData.startingPrice)}`
                    : 'Trade Only'
                  }
                </span>
                <span className="text-sm text-gray-500">
                  {getListingTypeLabel(formData.listingType)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Condition:</span>
                  <span className="ml-2">{getConditionLabel(formData.condition)}</span>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{formData.locationCity}</span>
                </div>
              </div>

              {formData.listingType === 'auction' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Auction Details</h3>
                  <div className="space-y-1 text-sm text-yellow-700">
                    <div>Starting Price: {formatPrice(formData.startingPrice)}</div>
                    <div>Duration: {formData.auctionDays} days</div>
                    {formData.reservePrice && (
                      <div>Reserve Price: {formatPrice(formData.reservePrice)}</div>
                    )}
                    {formData.buyNowPrice && (
                      <div>Buy Now Price: {formatPrice(formData.buyNowPrice)}</div>
                    )}
                    {calculateAuctionEndTime() && (
                      <div>Ends: {calculateAuctionEndTime()?.toLocaleString(locale)}</div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{formData.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Shipping Options</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {formData.shippingOptions.omniva && <div>• Omniva Parcel Machine</div>}
                  {formData.shippingOptions.dpd && <div>• DPD Pickup Point</div>}
                  {formData.shippingOptions.pickup && <div>• Local Pickup</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ListingForm 