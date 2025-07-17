import { supabase } from '@/lib/supabase';
import MarketplaceWithSearch from '@/components/marketplace/MarketplaceWithSearch';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { Suspense } from 'react';
import type { Listing } from '@/types';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function MarketplaceContent() {
  // Get all active listings with seller information (excluding auctions) - limit to 50 for performance
  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      listing_type,
      price,
      currency,
      condition,
      location_city,
      created_at,
      description,
      photos,
      users!listings_seller_id_fkey (
        username
      ),
      games!listings_game_id_fkey (
        title
      )
    `
    )
    .eq('status', 'active')
    .neq('listing_type', 'auction')
    .order('created_at', { ascending: false })
    .limit(50);

  // Get active auctions - limit to 20 for performance
  const { data: auctions } = await supabase
    .from('auctions')
    .select(
      `
      id,
      starting_price,
      current_price,
      reserve_price,
      bid_increment,
      end_time,
      extension_time,
      buy_now_price,
      status,
      winner_id,
      minimum_bid,
      created_at,
      updated_at,
      listings!auctions_listing_id_fkey (
        id,
        seller_id,
        game_id,
        listing_type,
        price,
        currency,
        condition,
        location_country,
        location_city,
        shipping_options,
        photos,
        description,
        status,
        verified_photos,
        created_at,
        users!listings_seller_id_fkey (
          username
        ),
        games!listings_game_id_fkey (
          title
        )
      )
    `
    )
    .eq('status', 'active')
    .order('end_time', { ascending: true })
    .limit(20);

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Error Loading Listings
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  // Map listings to ensure users and games are single objects
  const mappedListings = (listings || []).map(listing => ({
    ...listing,
    users: Array.isArray(listing.users) ? listing.users[0] : listing.users,
    games: Array.isArray(listing.games) ? listing.games[0] : listing.games,
  })) as Listing[];

  // Helper to recursively flatten arrays
  function flattenFirst(obj: any) {
    while (Array.isArray(obj)) obj = obj[0];
    return obj;
  }

  // Map auctions to ensure listings is a single object and its users/games are also single objects
  const mappedAuctions = (auctions || []).map(auction => {
    let listing = flattenFirst(auction.listings);
    if (listing && typeof listing === 'object') {
      let users = flattenFirst(listing.users);
      if (!users || typeof users !== 'object') users = { username: '' };
      let games = flattenFirst(listing.games);
      if (!games || typeof games !== 'object') games = { title: {} };
      listing = {
        ...listing,
        users,
        games,
      };
    } else {
      listing = {
        id: '',
        seller_id: '',
        game_id: '',
        listing_type: '',
        price: null,
        currency: '',
        condition: '',
        location_country: '',
        location_city: '',
        shipping_options: {},
        photos: [],
        description: {},
        status: '',
        verified_photos: false,
        created_at: '',
        users: { username: '' },
        games: { title: {} },
      };
    }
    return {
      ...auction,
      listings: listing,
    };
  });

  return (
    <div className='container mx-auto p-8 max-w-7xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Marketplace</h1>
        <p className='text-gray-600'>
          Browse and discover board games from the Baltic region
        </p>
      </div>

      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
          <div className='text-sm text-gray-600'>
            {listings?.length || 0} active listings
            {auctions && auctions.length > 0 && (
              <span className='ml-2 text-red-600'>
                • {auctions.length} active auctions
              </span>
            )}
          </div>
          <div className='flex gap-2'>
            <a
              href='/listings/create'
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Create Listing
            </a>
          </div>
        </div>
      </div>

      <MarketplaceWithSearch
        listings={mappedListings}
        auctions={mappedAuctions}
      />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto p-8 max-w-7xl'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Marketplace
            </h1>
            <p className='text-gray-600'>
              Browse and discover board games from the Baltic region
            </p>
          </div>
          <div className='flex justify-center py-12'>
            <LoadingSpinner size='lg' />
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
