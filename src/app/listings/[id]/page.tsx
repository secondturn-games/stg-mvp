import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingDetail from '@/components/listings/ListingDetail';
import {
  formatCurrency,
  formatRelativeTime,
  getUserLocale,
} from '@/lib/regional-settings';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      users (
        username,
        email
      ),
      games (
        title
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // If this is an auction listing, show auction information
  if (listing.listing_type === 'auction') {
    // Get the auction ID for this listing
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('id')
      .eq('listing_id', listing.id)
      .single();

    if (auction && !auctionError) {
      return (
        <div className='container mx-auto p-8 max-w-4xl'>
          <div className='text-center space-y-6'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Auction Listing
            </h1>
            <p className='text-gray-600 text-lg'>
              This is an auction listing. Click below to view the auction
              details, current bids, and place your bid.
            </p>
            <a
              href={`/auctions/${auction.id}`}
              className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
            >
              View Auction
            </a>
          </div>
        </div>
      );
    }
  }

  // Format the listing data with regional settings
  const locale = getUserLocale();
  const formattedListing = {
    ...listing,
    formattedPrice: listing.price
      ? formatCurrency(listing.price, locale)
      : 'Trade',
    formattedCreatedAt: formatRelativeTime(listing.created_at, locale),
  };

  return <ListingDetail listing={formattedListing} />;
}
