'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, Share2, ArrowLeft, Package } from 'lucide-react';
import {
  formatCurrency,
  formatAuctionTimeLeft,
  getUserLocale,
} from '@/lib/regional-settings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useToast } from '@/components/ui/ToastProvider';

interface Auction {
  id: string;
  listing_id: string;
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

interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  is_proxy: boolean;
  created_at: string;
  users: {
    username: string;
  };
}

interface AuctionDetailProps {
  auction: Auction;
  bids: Bid[];
}

export default function AuctionDetail({
  auction,
  bids: initialBids,
}: AuctionDetailProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bids, setBids] = useState(initialBids);
  const [timeLeft, setTimeLeft] = useState('');
  const locale = getUserLocale();
  const { showToast } = useToast();

  const gameTitle = auction.listings.games?.title?.en || 'Untitled Game';
  const description = auction.listings.description?.en || '';

  const isAuctionActive =
    auction.status === 'active' && new Date(auction.end_time) > new Date();

  // Update time left every second
  useEffect(() => {
    const updateTimeLeft = () => {
      setTimeLeft(formatAuctionTimeLeft(auction.end_time));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction.end_time]);

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

  const formatPrice = (price: number) => {
    return formatCurrency(price, locale);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingBid(true);

    try {
      const response = await fetch('/api/auctions/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auction.id,
          amount: parseFloat(bidAmount),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh bids
        const newBid = {
          id: result.bid.id,
          auction_id: auction.id,
          bidder_id: result.bid.bidder_id,
          amount: result.bid.amount,
          is_proxy: false,
          created_at: result.bid.created_at,
          users: { username: 'You' },
        };
        setBids(prev => [newBid, ...prev]);
        setBidAmount('');
        showToast('Bid placed successfully!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to place bid', 'error');
      }
    } catch (error) {
      showToast('An error occurred while placing your bid', 'error');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
    if (!auction.buy_now_price) return;

    if (
      !confirm(
        `Are you sure you want to buy this item for ${formatPrice(auction.buy_now_price)}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/auctions/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auction.id,
        }),
      });

      if (response.ok) {
        showToast('Purchase successful!', 'success');
        router.push('/marketplace');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to purchase', 'error');
      }
    } catch (error) {
      showToast('An error occurred while processing your purchase', 'error');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Back
        </button>

        <div className='flex items-center space-x-4'>
          <button className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
            <Heart className='h-5 w-5 mr-2' />
            Watch
          </button>
          <button className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
            <Share2 className='h-5 w-5 mr-2' />
            Share
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Images */}
        <div className='space-y-4'>
          {auction.listings.photos && auction.listings.photos.length > 0 ? (
            <>
              <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                <OptimizedImage
                  src={auction.listings.photos[selectedImage]}
                  alt={gameTitle}
                  className='w-full h-full object-cover'
                />
              </div>
              {auction.listings.photos.length > 1 && (
                <div className='grid grid-cols-4 gap-2'>
                  {auction.listings.photos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <OptimizedImage
                        src={photo}
                        alt={`${gameTitle} ${index + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className='aspect-square bg-gray-100 rounded-lg flex items-center justify-center'>
              <Package className='h-12 w-12 text-gray-400' />
            </div>
          )}
        </div>

        {/* Auction Info */}
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {gameTitle}
            </h1>
            <p className='text-gray-600'>{description}</p>
          </div>

          {/* Current Price */}
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-red-600 font-medium'>
                  Current Price
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {formatPrice(auction.current_price)}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-red-600 font-medium'>Time Left</p>
                <p
                  className={`text-lg font-bold ${timeLeft.includes('Ended') ? 'text-red-600' : 'text-red-600'}`}
                >
                  {timeLeft}
                </p>
              </div>
            </div>
          </div>

          {/* Bidding Section */}
          {isAuctionActive && (
            <form onSubmit={handleBidSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='bidAmount'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Your Bid (EUR)
                </label>
                <input
                  type='number'
                  id='bidAmount'
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  min={auction.current_price + auction.bid_increment}
                  step='0.01'
                  required
                  placeholder={`Min: €${(auction.current_price + auction.bid_increment).toFixed(2)}`}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <button
                type='submit'
                disabled={isPlacingBid}
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isPlacingBid ? (
                  <div className='flex items-center justify-center'>
                    <LoadingSpinner size='sm' className='mr-2' />
                    Placing Bid...
                  </div>
                ) : (
                  'Place Bid'
                )}
              </button>
            </form>
          )}

          {/* Buy Now Button */}
          {isAuctionActive && auction.buy_now_price && (
            <div className='mt-4'>
              <button
                onClick={handleBuyNow}
                className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors'
              >
                Buy Now for {formatPrice(auction.buy_now_price)}
              </button>
            </div>
          )}

          {/* Auction Info */}
          <div className='mt-6 space-y-2 text-sm text-gray-600'>
            <div className='flex justify-between'>
              <span>Starting Price:</span>
              <span>{formatPrice(auction.starting_price)}</span>
            </div>
            {auction.reserve_price && (
              <div className='flex justify-between'>
                <span>Reserve Price:</span>
                <span>{formatPrice(auction.reserve_price)}</span>
              </div>
            )}
            <div className='flex justify-between'>
              <span>Bid Increment:</span>
              <span>{formatPrice(auction.bid_increment)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Seller Info */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold mb-4'>Seller Information</h3>
          <div className='space-y-2'>
            <div className='flex items-center'>
              <span className='font-medium'>Seller:</span>
              <span className='ml-2'>{auction.listings.users.username}</span>
            </div>
            <div className='flex items-center'>
              <MapPin className='h-4 w-4 mr-2 text-gray-500' />
              <span>{auction.listings.location_city}</span>
            </div>
            <div className='flex items-center'>
              <span className='font-medium'>Condition:</span>
              <span className='ml-2'>
                {getConditionLabel(auction.listings.condition)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-lg font-semibold mb-4'>Shipping Options</h3>
          <div className='space-y-2'>
            {auction.listings.shipping_options?.omniva && (
              <div className='flex items-center'>
                <Package className='h-4 w-4 mr-2 text-gray-500' />
                <span>Omniva Pickup</span>
              </div>
            )}
            {auction.listings.shipping_options?.dpd && (
              <div className='flex items-center'>
                <Package className='h-4 w-4 mr-2 text-gray-500' />
                <span>DPD Delivery</span>
              </div>
            )}
            {auction.listings.shipping_options?.pickup && (
              <div className='flex items-center'>
                <MapPin className='h-4 w-4 mr-2 text-gray-500' />
                <span>Local Pickup</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold mb-4'>Bid History</h3>

        {bids.length === 0 ? (
          <p className='text-gray-500'>No bids yet. Be the first to bid!</p>
        ) : (
          <div className='space-y-3'>
            {bids.map(bid => (
              <div
                key={bid.id}
                className='flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0'
              >
                <div>
                  <span className='font-medium'>{bid.users.username}</span>
                  <span className='text-sm text-gray-500 ml-2'>
                    {new Date(bid.created_at).toLocaleString(locale)}
                  </span>
                </div>
                <span className='font-bold text-blue-600'>
                  {formatPrice(bid.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal (placeholder) */}
      {isContactOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Contact Seller</h3>
            <p className='text-gray-600 mb-4'>
              Contact feature coming soon! For now, you can reach out to the
              seller through their profile.
            </p>
            <button
              onClick={() => setIsContactOpen(false)}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
