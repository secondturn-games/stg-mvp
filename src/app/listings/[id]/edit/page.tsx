import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import ListingForm from '@/components/listings/ListingForm'

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Fetch the listing
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()
  if (!profile) redirect('/profile/setup')

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', profile.id)
    .single()
  if (error || !listing) redirect('/profile/my-listings')

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
      <ListingForm mode="edit" initialValues={listing} />
    </div>
  )
} 