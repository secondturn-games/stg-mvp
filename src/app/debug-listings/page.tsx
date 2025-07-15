import { supabase } from '@/lib/supabase'

export default async function DebugListingsPage() {
  // Get ALL listings (not just active ones)
  const { data: allListings, error } = await supabase
    .from('listings')
    .select(`
      *,
      users!listings_seller_id_fkey (
        username
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug: All Listings</h1>
        <p className="text-gray-600">Showing all listings in the database</p>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-600">
          Total listings: {allListings?.length || 0}
        </div>
      </div>

      <div className="space-y-4">
        {allListings?.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {listing.description?.en?.split(' - ')[0] || 'Untitled Game'}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {listing.id}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${
                    listing.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {listing.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(listing.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Price: {listing.price ? `€${listing.price}` : 'Trade'}
                </p>
                <p className="text-sm text-gray-600">
                  Photos: {listing.photos?.length || 0} images
                </p>
                <p className="text-sm text-gray-600">
                  Location: {listing.location_city}
                </p>
              </div>
            </div>

            {listing.photos && listing.photos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Photos:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {listing.photos.map((photo: string, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(!allListings || allListings.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Found</h3>
          <p className="text-gray-600">There are no listings in the database.</p>
        </div>
      )}
    </div>
  )
} 