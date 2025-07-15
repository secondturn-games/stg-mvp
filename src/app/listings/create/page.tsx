import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/user-service';
import ListingForm from '@/components/listings/ListingForm';

export default async function CreateListingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/profile/setup');
  }

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Create New Listing
        </h1>
        <p className='text-gray-600'>Add a game to your marketplace</p>
      </div>

      <div className='bg-white rounded-lg shadow border p-6'>
        <ListingForm />
      </div>

      <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
        <h2 className='text-lg font-semibold mb-2'>
          Tips for a Great Listing:
        </h2>
        <ul className='list-disc list-inside space-y-1 text-sm text-gray-600'>
          <li>Take clear, well-lit photos of the game</li>
          <li>Be honest about the condition</li>
          <li>Include all components in your description</li>
          <li>Set a competitive price</li>
          <li>Specify your shipping preferences</li>
        </ul>
      </div>
    </div>
  );
}
