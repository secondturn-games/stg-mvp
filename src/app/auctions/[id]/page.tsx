import { supabase } from '@/lib/supabase';
import AuctionDetail from '@/components/auctions/AuctionDetail';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

async function AuctionPageContent({ params }: { params: { id: string } }) {
  // First, try to get just the auction without joins
  const { data: auctionBasic, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (auctionError || !auctionBasic) {
    notFound();
  }

  // Now get the listing details separately
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(
      `
      *,
      users!listings_seller_id_fkey (
        username
      ),
      games!listings_game_id_fkey (
        title
      )
    `
    )
    .eq('id', auctionBasic.listing_id)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  // Combine the data
  const auction = {
    ...auctionBasic,
    listings: listing,
  };

  // Get bids for this auction
  const { data: bids, error: bidsError } = await supabase
    .from('bids')
    .select(
      `
      *,
      users!bids_bidder_id_fkey (
        username
      )
    `
    )
    .eq('auction_id', params.id)
    .order('created_at', { ascending: false });

  if (bidsError) {
    // Handle error gracefully in UI
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Error Loading Bids
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-8 max-w-7xl'>
      <AuctionDetail auction={auction} bids={bids || []} />
    </div>
  );
}

export default function AuctionPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto p-8 max-w-7xl'>
          <div className='flex justify-center py-12'>
            <LoadingSpinner size='lg' />
          </div>
        </div>
      }
    >
      <AuctionPageContent params={params} />
    </Suspense>
  );
}
