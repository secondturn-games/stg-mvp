import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ListingDetail from '@/components/listings/ListingDetail'

interface ListingPageProps {
  params: {
    id: string
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = params

  // Get the specific listing with all related data
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      users!listings_seller_id_fkey (
        id,
        username,
        avatar_url,
        email,
        country
      )
    `)
    .eq('id', id)
    .single()

  if (error || !listing) {
    console.error('Error fetching listing:', error)
    notFound()
  }

  // Check if listing is active
  if (listing.status !== 'active') {
    notFound()
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <ListingDetail listing={listing} />
    </div>
  )
} 