'use client';

import { useState, useMemo } from 'react';
import SearchFilters from './SearchFilters';
import MarketplaceListings from './MarketplaceListings';
import AuctionCard from './AuctionCard';
import { filterListings, getSearchStats } from '@/lib/search-utils';
import type { FilterState } from './SearchFilters';

interface Listing {
  id: string;
  listing_type: 'fixed' | 'auction' | 'trade';
  price: number | null;
  currency: string;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  location_city: string;
  created_at: string;
  description: Record<string, string>;
  photos: string[];
  users: {
    username: string;
  };
  games: {
    title: Record<string, string>;
  };
}

interface Auction {
  id: string;
  starting_price: number;
  current_price: number;
  reserve_price: number | null;
  bid_increment: number;
  end_time: string;
  extension_time: number;
  buy_now_price: number | null;
  status: 'active' | 'ended' | 'cancelled' | 'reserved';
  winner_id: string | null;
  minimum_bid: number;
  created_at: string;
  updated_at: string;
  listings: {
    id: string;
    seller_id: string;
    game_id: string;
    listing_type: string;
    price: number | null;
    currency: string;
    condition: string;
    location_country: string;
    location_city: string;
    shipping_options: Record<string, any>;
    photos: string[];
    description: Record<string, string>;
    status: string;
    verified_photos: boolean;
    created_at: string;
    users: {
      username: string;
    };
    games: {
      title: Record<string, string>;
    };
  };
}

interface MarketplaceWithSearchProps {
  listings: Listing[];
  auctions: Auction[];
}

export default function MarketplaceWithSearch({
  listings,
  auctions,
}: MarketplaceWithSearchProps) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    condition: [],
    priceRange: { min: 0, max: 1000 },
    location: [],
    listingType: [],
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return filterListings(listings, search, filters, sortBy);
  }, [listings, search, filters, sortBy]);

  // Filter auctions (for now, just show all active auctions)
  const filteredAuctions = useMemo(() => {
    return auctions.filter(
      auction =>
        auction.status === 'active' && new Date(auction.end_time) > new Date()
    );
  }, [auctions]);

  const stats = getSearchStats(listings, filteredListings);

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <SearchFilters
        onSearchChange={setSearch}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
      />

      {/* Results Stats */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          {stats.filtered} of {stats.total} listings
          {search && (
            <span className='ml-2 text-blue-600'>for &quot;{search}&quot;</span>
          )}
        </div>
        {stats.filtered === 0 && stats.total > 0 && (
          <div className='text-sm text-gray-500'>
            No results found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Auctions Section */}
      {filteredAuctions.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Active Auctions
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
            {filteredAuctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <MarketplaceListings listings={filteredListings} />
    </div>
  );
}
