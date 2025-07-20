import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileCompletionMeter from '@/components/ui/ProfileCompletionMeter';
import ProfileStrengthIndicator from '@/components/ui/ProfileStrengthIndicator';
import QuickActionsDashboard from '@/components/ui/QuickActionsDashboard';
import ActivityTimeline from '@/components/ui/ActivityTimeline';
import { calculateProfileCompletion } from '@/lib/profile-completion';
import { calculateProfileStrength } from '@/lib/profile-strength';
import {
  formatCurrency,
  formatRelativeTime,
  getUserLocale,
} from '@/lib/regional-settings';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (profileError) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Error Loading Profile
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  // If no profile exists, redirect to setup
  if (!profile) {
    redirect('/profile/setup');
  }

  // Get user's listings using the actual user ID from the users table
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(
      `
      *,
      games!listings_game_id_fkey (
        title
      )
    `
    )
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false });

  if (listingsError) {
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

  // Get user's purchases using the actual user ID from the users table
  const { data: purchases, error: purchasesError } = await supabase
    .from('transactions')
    .select(
      `
      *,
      listings (
        id,
        description,
        photos,
        games!listings_game_id_fkey (
          title
        )
      )
    `
    )
    .eq('buyer_id', profile.id)
    .order('created_at', { ascending: false });

  if (purchasesError) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Error Loading Purchases
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  // Format data with regional settings
  const locale = getUserLocale();
  const formattedListings =
    listings?.map(listing => ({
      ...listing,
      formattedPrice: listing.price
        ? formatCurrency(listing.price, locale)
        : 'Trade',
      formattedCreatedAt: formatRelativeTime(listing.created_at, locale),
      gameTitle: listing.games?.title?.en || 'Untitled Game',
    })) || [];

  const formattedPurchases =
    purchases?.map(purchase => ({
      ...purchase,
      formattedAmount: formatCurrency(purchase.amount, locale),
      formattedCreatedAt: formatRelativeTime(purchase.created_at, locale),
      gameTitle: purchase.listings?.games?.title?.en || 'Game',
    })) || [];

  // Calculate profile completion and strength
  const profileCompletion = calculateProfileCompletion(profile);
  
  // Calculate user stats for profile strength
  const userStats = {
    activeListings: formattedListings.filter(l => l.status === 'active').length,
    totalListings: formattedListings.length,
    totalTransactions: formattedPurchases.length,
    totalVolume: formattedPurchases.reduce((sum, p) => sum + p.amount, 0),
  };
  
  const profileStrength = calculateProfileStrength(profile, userStats);

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='space-y-8'>
        {/* Profile Header */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-2xl font-bold text-blue-600'>
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {profile?.username || 'Anonymous User'}
              </h1>
              <p className='text-gray-600'>
                Member since{' '}
                {profile?.created_at
                  ? new Date(profile.created_at).getFullYear()
                  : '2024'}
              </p>
              {profile?.location_city && (
                <p className='text-sm text-gray-500'>
                  📍 {profile.location_city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion Meter */}
        {profileCompletion.percentage < 100 && (
          <ProfileCompletionMeter 
            completion={profileCompletion} 
            showDetails={false}
            className="shadow-md"
          />
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Strength & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Strength Indicator */}
            <ProfileStrengthIndicator 
              strength={profileStrength}
              showDetails={false}
              className="shadow-md"
            />

            {/* Quick Actions Dashboard */}
            <QuickActionsDashboard
              profileStrength={profileStrength}
              userStats={userStats}
              className="shadow-md"
            />

            {/* Stats */}
            <ProfileStats
              listingsCount={formattedListings.length}
              purchasesCount={formattedPurchases.length}
              totalSpent={formattedPurchases.reduce((sum, p) => sum + p.amount, 0)}
            />
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="lg:col-span-1">
            <ActivityTimeline
              maxEvents={8}
              className="shadow-md"
            />
          </div>
        </div>

        {/* Legacy Actions (keeping for compatibility) */}
        <ProfileActions />

        {/* Recent Activity */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* My Listings */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>My Listings</h2>
            {formattedListings.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>
                You haven&apos;t created any listings yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {formattedListings.slice(0, 5).map(listing => (
                  <div
                    key={listing.id}
                    className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center'>
                      {listing.photos && listing.photos.length > 0 ? (
                        <Image
                          src={listing.photos[0]}
                          alt='Game'
                          width={48}
                          height={48}
                          className='w-full h-full object-cover rounded-lg'
                        />
                      ) : (
                        <span className='text-lg'>🎲</span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>{listing.gameTitle}</p>
                      <p className='text-xs text-gray-500'>
                        {listing.formattedPrice} • {listing.formattedCreatedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Purchases */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Recent Purchases</h2>
            {formattedPurchases.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>
                You haven&apos;t made any purchases yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {formattedPurchases.slice(0, 5).map(purchase => (
                  <div
                    key={purchase.id}
                    className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center'>
                      {purchase.listings?.photos &&
                      purchase.listings.photos.length > 0 ? (
                        <Image
                          src={purchase.listings.photos[0]}
                          alt='Game'
                          width={48}
                          height={48}
                          className='w-full h-full object-cover rounded-lg'
                        />
                      ) : (
                        <span className='text-lg'>🎲</span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>
                        {purchase.gameTitle}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {purchase.formattedAmount} •{' '}
                        {purchase.formattedCreatedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
