import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ListingDetail from '@/components/listings/ListingDetail'
import { formatCurrency, formatRelativeTime, getUserLocale } from '@/lib/regional-settings'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      users (
        username,
        email
      ),
      games (
        title
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !listing) {
    notFound()
  }

  // Format the listing data with regional settings
  const locale = getUserLocale()
  const formattedListing = {
    ...listing,
    formattedPrice: listing.price ? formatCurrency(listing.price, locale) : 'Trade',
    formattedCreatedAt: formatRelativeTime(listing.created_at, locale)
  }

  return <ListingDetail listing={formattedListing} />
} 