'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import { getUserLocale, ensure24HourFormat, validate24HourTime } from '@/lib/regional-settings'

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
  shippingOptions: {
    omniva: boolean
    dpd: boolean
    pickup: boolean
  }
  // Auction-specific fields
  startingPrice: string
  endTime: string
  reservePrice: string
  buyNowPrice: string
  bidIncrement: string
}

export default function ListingForm() {
  const router = useRouter()
  const locale = getUserLocale()
  
  const [formData, setFormData] = useState<ListingFormData>({
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
    // Auction-specific fields
    startingPrice: '',
    endTime: '',
    reservePrice: '',
    buyNowPrice: '',
    bidIncrement: '1.00'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Get minimum date for auction end time (24 hours from now)
  const getMinDate = () => {
    const now = new Date()
    now.setHours(now.getHours() + 24) // Minimum 24 hours from now
    return now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
  }

  // Format time for display (24-hour format)
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Validate time format
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
        // Redirect to the new listing after a short delay
        setTimeout(() => {
          router.push(`/listings/${result.listing.id}`)
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
    
    // Ensure 24-hour format for datetime inputs
    if (name === 'endTime' && value) {
      const formattedValue = ensure24HourFormat(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
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

  return (
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
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time (24h format) *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    min={getMinDate()}
                    step="900"
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                    24h
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Use 24-hour format (e.g., 14:30 for 2:30 PM). Minimum 24 hours from now.
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Current: {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Tip: If you see AM/PM, please use 24-hour time (00:00-23:59)
                </p>
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
                <li>• Reserve price is optional but protects your minimum price</li>
                <li>• Buy Now price allows instant purchase</li>
                <li>• Auctions automatically extend if bids are placed near the end</li>
                <li>• All times are in 24-hour format (Baltic standard)</li>
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating Listing...' : 'Create Listing'}
        </button>
      </div>
    </form>
  )
} 