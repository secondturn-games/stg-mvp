'use client';

import { useRouter } from 'next/navigation';
import EmptyState from '@/components/feedback/EmptyState';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { formatRelativeTime, getUserLocale } from '@/lib/regional-settings';

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

interface MarketplaceListingsProps {
  listings: Listing[];
}

export default function MarketplaceListings({
  listings,
}: MarketplaceListingsProps) {
  const router = useRouter();
  const locale = getUserLocale();

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New';
      case 'like_new':
        return 'Like New';
      case 'very_good':
        return 'Very Good';
      case 'good':
        return 'Good';
      case 'acceptable':
        return 'Acceptable';
      default:
        return condition;
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'Fixed Price';
      case 'auction':
        return 'Auction';
      case 'trade':
        return 'Trade Only';
      default:
        return type;
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Trade Only';
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getTimeAgo = (dateString: string) => {
    return formatRelativeTime(dateString, locale);
  };

  if (listings.length === 0) {
    return (
      <EmptyState
        title='No Listings Available'
        description='Be the first to create a listing and start selling your board games!'
        icon='🎲'
        action={{
          label: 'Create Your First Listing',
          href: '/listings/create',
        }}
      />
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
      {listings.map(listing => (
        <div
          key={listing.id}
          className='bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer group'
          onClick={() => router.push(`/listings/${listing.id}`)}
        >
          {/* Game Image */}
          <div className='aspect-square bg-gray-100 rounded-t-lg overflow-hidden'>
            {listing.photos && listing.photos.length > 0 ? (
              <OptimizedImage
                src={listing.photos[0]}
                alt={listing.games?.title?.en || 'Game'}
                className='w-full h-full rounded-t-lg'
                fallback='🎲'
              />
            ) : (
              <div className='text-gray-400 text-center p-4 flex items-center justify-center h-full'>
                <div className='text-center'>
                  <div className='text-4xl mb-2'>🎲</div>
                  <div className='text-sm'>No Image</div>
                </div>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className='p-4'>
            <h3 className='font-semibold text-gray-900 mb-1 line-clamp-2'>
              {listing.games?.title?.en || 'Untitled Game'}
            </h3>

            <div className='flex items-center justify-between mb-2'>
              <span className='text-lg font-bold text-blue-600'>
                {formatPrice(listing.price)}
              </span>
              <span className='text-xs text-gray-500'>
                {getTimeAgo(listing.created_at)}
              </span>
            </div>

            <div className='space-y-1 text-sm text-gray-600'>
              <div className='flex items-center justify-between'>
                <span>Condition:</span>
                <span className='font-medium'>
                  {getConditionLabel(listing.condition)}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span>Type:</span>
                <span className='font-medium'>
                  {getListingTypeLabel(listing.listing_type)}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span>Location:</span>
                <span className='font-medium'>{listing.location_city}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className='mt-3 pt-3 border-t border-gray-100'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2'>
                    <span className='text-xs text-gray-500'>
                      {listing.users.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className='text-sm text-gray-600'>
                    {listing.users.username || 'Anonymous'}
                  </span>
                </div>
                <div className='text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                  View Details →
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
