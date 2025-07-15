'use client'

import { useState, useMemo } from 'react'
import SearchFilters from './SearchFilters'
import MarketplaceListings from './MarketplaceListings'
import { filterListings, getSearchStats } from '@/lib/search-utils'
import type { FilterState } from './SearchFilters'

interface Listing {
  id: string
  listing_type: 'fixed' | 'auction' | 'trade'
  price: number | null
  currency: string
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
  location_city: string
  location_country: string
  created_at: string
  description: Record<string, string>
  photos: string[]
  users: {
    username: string
  }
}

interface MarketplaceWithSearchProps {
  listings: Listing[]
}

export default function MarketplaceWithSearch({ listings }: MarketplaceWithSearchProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    condition: [],
    priceRange: { min: 0, max: 1000 },
    location: [],
    listingType: []
  })
  const [sortBy, setSortBy] = useState('relevance')

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return filterListings(listings, search, filters, sortBy)
  }, [listings, search, filters, sortBy])

  const stats = getSearchStats(listings, filteredListings)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchFilters 
        onSearchChange={setSearch}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
      />

      {/* Results Stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {stats.filtered} of {stats.total} listings
          {search && (
            <span className="ml-2 text-blue-600">
              for "{search}"
            </span>
          )}
        </div>
        {stats.filtered === 0 && stats.total > 0 && (
          <div className="text-sm text-gray-500">
            No results found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Listings */}
      <MarketplaceListings listings={filteredListings} />
    </div>
  )
} 