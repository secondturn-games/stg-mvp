import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import ListingForm from '@/components/listings/ListingForm';

export default async function EditAuctionPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fetch the auction and related listing
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();
  if (!profile) redirect('/profile/setup');

  const { data: auction, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', params.id)
    .single();
  if (auctionError || !auction) redirect('/profile/my-listings');

  // Fetch the related listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', auction.listing_id)
    .single();
  if (listingError || !listing) redirect('/profile/my-listings');

  // Check ownership
  if (listing.seller_id !== profile.id) redirect('/profile/my-listings');

  // Combine auction and listing data for the form
  const formData = {
    ...listing,
    ...auction,
    listingType: 'auction' as const,
    startingPrice: auction.starting_price.toString(),
    currentPrice: auction.current_price.toString(),
    reservePrice: auction.reserve_price?.toString() || '',
    buyNowPrice: auction.buy_now_price?.toString() || '',
    bidIncrement: auction.bid_increment.toString(),
    endTime: new Date(auction.end_time).toISOString().slice(0, 16),
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-lg'>
      <h1 className='text-2xl font-bold mb-4'>Edit Auction</h1>
      <ListingForm mode='edit' initialValues={formData} />
    </div>
  );
}
