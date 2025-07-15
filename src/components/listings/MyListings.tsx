'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  listing_type: 'fixed' | 'auction' | 'trade';
  price: number | null;
  currency: string;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  location_city: string;
  status: 'active' | 'sold' | 'cancelled' | 'reserved';
  created_at: string;
  description: Record<string, string>;
  photos: string[];
}

interface MyListingsProps {
  listings: Listing[];
}

export default function MyListings({ listings }: MyListingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setIsLoading(listingId);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to show updated listings
        router.refresh();
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      alert('Error deleting listing');
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New (Sealed)';
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

  if (listings.length === 0) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          No Listings Yet
        </h3>
        <p className='text-gray-600 mb-4'>
          Create your first listing to start selling games!
        </p>
        <a
          href='/listings/create'
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Create Your First Listing
        </a>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {listings.map(listing => (
        <div key={listing.id} className='bg-white rounded-lg shadow border p-6'>
          <div className='flex justify-between items-start mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {listing.description?.en?.split(' - ')[0] || 'Untitled Game'}
              </h3>
              <p className='text-sm text-gray-600'>
                {getListingTypeLabel(listing.listing_type)}
                {listing.price && ` • €${listing.price}`}
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(listing.status)}`}
              >
                {listing.status.charAt(0).toUpperCase() +
                  listing.status.slice(1)}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm'>
            <div>
              <span className='font-medium text-gray-700'>Condition:</span>
              <p className='text-gray-600'>
                {getConditionLabel(listing.condition)}
              </p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Location:</span>
              <p className='text-gray-600'>{listing.location_city}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Created:</span>
              <p className='text-gray-600'>
                {new Date(listing.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>ID:</span>
              <p className='text-gray-600 font-mono text-xs'>
                {listing.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => router.push(`/listings/${listing.id}/edit`)}
              className='bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors'
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(listing.id)}
              disabled={isLoading === listing.id}
              className='bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors'
            >
              {isLoading === listing.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
