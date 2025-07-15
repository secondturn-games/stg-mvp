import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/user-service';
import { supabase } from '@/lib/supabase';
import MyListings from '@/components/listings/MyListings';

export default async function MyListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/profile/setup');
  }

  // Get user's listings
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false });

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

  return (
    <div className='container mx-auto p-8 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Listings</h1>
        <p className='text-gray-600'>Manage your game listings</p>
      </div>

      <div className='mb-6'>
        <a
          href='/listings/create'
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Create New Listing
        </a>
      </div>

      <MyListings listings={listings || []} />
    </div>
  );
}
