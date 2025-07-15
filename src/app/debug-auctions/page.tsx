import { supabase } from '@/lib/supabase'

export default async function DebugAuctionsPage() {
  // Get all auctions
  const { data: auctions, error } = await supabase
    .from('auctions')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  // Try to get the specific auction that's failing
  const { data: specificAuction, error: specificError } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', 'ce0881a9-591a-4f10-99ab-4f65b147f308')
    .single()

  // Try to get the specific listing that's failing
  const { data: specificListing, error: specificListingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', 'ce0881a9-591a-4f10-99ab-4f65b147f308')
    .single()

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Debug Auctions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Specific Auction Query */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Specific Auction Query</h2>
          <div className="space-y-2">
            <p><strong>Query:</strong> SELECT * FROM auctions WHERE id = 'ce0881a9-591a-4f10-99ab-4f65b147f308'</p>
            <p><strong>Result:</strong> {specificAuction ? 'Found' : 'Not found'}</p>
            <p><strong>Error:</strong> {specificError ? JSON.stringify(specificError) : 'None'}</p>
            {specificAuction && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(specificAuction, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Specific Listing Query */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Specific Listing Query</h2>
          <div className="space-y-2">
            <p><strong>Query:</strong> SELECT * FROM listings WHERE id = 'ce0881a9-591a-4f10-99ab-4f65b147f308'</p>
            <p><strong>Result:</strong> {specificListing ? 'Found' : 'Not found'}</p>
            <p><strong>Error:</strong> {specificListingError ? JSON.stringify(specificListingError) : 'None'}</p>
            {specificListing && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(specificListing, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* All Auctions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Auctions ({auctions?.length || 0})</h2>
          <div className="space-y-2">
            {auctions?.map((auction) => (
              <div key={auction.id} className="border p-2 rounded">
                <p><strong>ID:</strong> {auction.id}</p>
                <p><strong>Listing ID:</strong> {auction.listing_id}</p>
                <p><strong>Status:</strong> {auction.status}</p>
                <p><strong>Created:</strong> {new Date(auction.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* All Listings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Listings ({listings?.length || 0})</h2>
          <div className="space-y-2">
            {listings?.map((listing) => (
              <div key={listing.id} className="border p-2 rounded">
                <p><strong>ID:</strong> {listing.id}</p>
                <p><strong>Type:</strong> {listing.listing_type}</p>
                <p><strong>Status:</strong> {listing.status}</p>
                <p><strong>Created:</strong> {new Date(listing.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 