import { supabase } from '@/lib/supabase'
import MarketplaceWithSearch from '@/components/marketplace/MarketplaceWithSearch'

export default async function MarketplacePage() {
  // Get all active listings with seller information
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      users!listings_seller_id_fkey (
        username
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Browse and discover board games from the Baltic region</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-600">
            {listings?.length || 0} active listings
          </div>
          <div className="flex gap-2">
            <a 
              href="/listings/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Listing
            </a>
          </div>
        </div>
      </div>

      <MarketplaceWithSearch listings={listings || []} />
    </div>
  )
} 