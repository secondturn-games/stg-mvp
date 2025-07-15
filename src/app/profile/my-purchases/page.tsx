import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  formatCurrency,
  formatRelativeTime,
  getUserLocale,
} from '@/lib/regional-settings';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default async function MyPurchasesPage() {
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

  if (!profile) {
    redirect('/profile/setup');
  }

  // Get user's purchases
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

  const locale = getUserLocale();
  const formattedPurchases =
    purchases?.map(purchase => ({
      ...purchase,
      formattedAmount: formatCurrency(purchase.amount, locale),
      formattedCreatedAt: formatRelativeTime(purchase.created_at, locale),
      gameTitle: purchase.listings?.games?.title?.en || 'Game',
    })) || [];

  const totalSpent = formattedPurchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link
              href='/profile'
              className='flex items-center text-gray-600 hover:text-gray-900'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Profile
            </Link>
            <h1 className='text-3xl font-bold text-gray-900'>My Purchases</h1>
          </div>
        </div>

        {/* Stats */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {formattedPurchases.length}
              </div>
              <div className='text-sm text-gray-600'>Total Purchases</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(totalSpent, locale)}
              </div>
              <div className='text-sm text-gray-600'>Total Spent</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {
                  formattedPurchases.filter(p => p.status === 'completed')
                    .length
                }
              </div>
              <div className='text-sm text-gray-600'>Completed</div>
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className='bg-white rounded-lg shadow-md'>
          <div className='p-6 border-b'>
            <h2 className='text-xl font-semibold'>Purchase History</h2>
          </div>

          {formattedPurchases.length === 0 ? (
            <div className='p-8 text-center'>
              <div className='text-6xl mb-4'>🛒</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No Purchases Yet
              </h3>
              <p className='text-gray-600 mb-4'>
                Start exploring the marketplace to find great board games.
              </p>
              <Link
                href='/marketplace'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className='divide-y'>
              {formattedPurchases.map(purchase => (
                <div key={purchase.id} className='p-6 hover:bg-gray-50'>
                  <div className='flex items-center space-x-4'>
                    {/* Image */}
                    <div className='w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0'>
                      {purchase.listings?.photos &&
                      purchase.listings.photos.length > 0 ? (
                        <img
                          src={purchase.listings.photos[0]}
                          alt={purchase.gameTitle}
                          className='w-full h-full object-cover rounded-lg'
                        />
                      ) : (
                        <span className='text-xl'>🎲</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='font-semibold text-gray-900 truncate'>
                            {purchase.gameTitle}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {purchase.formattedAmount} •{' '}
                            {purchase.formattedCreatedAt}
                          </p>
                          <div className='flex items-center space-x-2 mt-1'>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                purchase.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : purchase.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {purchase.status.charAt(0).toUpperCase() +
                                purchase.status.slice(1)}
                            </span>
                            <span className='text-xs text-gray-500'>
                              Transaction #{purchase.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center space-x-2'>
                          <Link
                            href={`/listings/${purchase.listings?.id}`}
                            className='text-blue-600 hover:text-blue-800 text-sm'
                          >
                            View Listing
                          </Link>
                          {purchase.status === 'completed' && (
                            <div className='flex items-center text-green-600 text-sm'>
                              <CheckCircle className='h-4 w-4 mr-1' />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
