'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ListingFormData {
  gameTitle: string
  gameId: string | null
  listingType: 'fixed' | 'auction' | 'trade'
  price: string
  currency: 'EUR'
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
  locationCity: string
  description: string
  shippingOptions: {
    omniva: boolean
    dpd: boolean
    pickup: boolean
  }
}

export default function ListingForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<ListingFormData>({
    gameTitle: '',
    gameId: null,
    listingType: 'fixed',
    price: '',
    currency: 'EUR',
    condition: 'very_good',
    locationCity: '',
    description: '',
    shippingOptions: {
      omniva: true,
      dpd: true,
      pickup: true
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

        {formData.listingType !== 'trade' && (
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