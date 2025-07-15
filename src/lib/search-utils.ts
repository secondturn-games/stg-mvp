import type { FilterState } from '@/components/marketplace/SearchFilters';

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

export function filterListings(
  listings: Listing[],
  search: string,
  filters: FilterState,
  sortBy: string
): Listing[] {
  let filtered = listings;

  // Search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(listing => {
      const gameTitle = listing.games?.title?.en || '';
      const description = listing.description?.en || '';
      return (
        gameTitle.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower)
      );
    });
  }

  // Condition filter
  if (filters.condition.length > 0) {
    filtered = filtered.filter(listing =>
      filters.condition.includes(listing.condition)
    );
  }

  // Price range filter
  if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
    filtered = filtered.filter(listing => {
      // Include trade listings (price is null) in all price ranges
      if (listing.price === null) return true;
      return (
        listing.price >= filters.priceRange.min &&
        listing.price <= filters.priceRange.max
      );
    });
  }

  // Location filter
  if (filters.location.length > 0) {
    filtered = filtered.filter(listing =>
      filters.location.includes(listing.location_city)
    );
  }

  // Listing type filter
  if (filters.listingType.length > 0) {
    filtered = filtered.filter(listing =>
      filters.listingType.includes(listing.listing_type)
    );
  }

  // Sort results
  filtered = sortListings(filtered, sortBy);

  return filtered;
}

function sortListings(listings: Listing[], sortBy: string): Listing[] {
  const sorted = [...listings];

  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });

    case 'price_high':
      return sorted.sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      });

    case 'date_new':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    case 'date_old':
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    case 'relevance':
    default:
      // For relevance, we could implement more sophisticated ranking
      // For now, just sort by date (newest first)
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export function getSearchStats(listings: Listing[], filtered: Listing[]) {
  return {
    total: listings.length,
    filtered: filtered.length,
    hasResults: filtered.length > 0,
  };
}
