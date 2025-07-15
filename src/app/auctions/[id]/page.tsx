import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AuctionDetail from '@/components/auctions/AuctionDetail'

interface AuctionPageProps {
  params: {
    id: string
  }
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  // Fetch auction with listing and game details
  const { data: auction, error } = await supabase
    .from('auctions')
    .select(`
      *,
      listings!auctions_listing_id_fkey (
        *,
        users!listings_seller_id_fkey (
          username
        ),
        games!listings_game_id_fkey (
          title
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !auction) {
    notFound()
  }

  // Fetch bids for this auction
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      users!bids_bidder_id_fkey (
        username
      )
    `)
    .eq('auction_id', params.id)
    .order('amount', { ascending: false })

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <AuctionDetail 
        auction={auction} 
        bids={bids || []} 
      />
    </div>
  )
} 