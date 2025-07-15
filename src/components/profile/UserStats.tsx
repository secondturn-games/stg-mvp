interface UserStatsProps {
  stats: {
    activeListings: number
    totalListings: number
    totalTransactions: number
    totalVolume: number
  } | null
}

export default function UserStats({ stats }: UserStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Stats</h3>
        <p className="text-sm text-gray-500">No activity data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Stats</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Listings</span>
          <span className="text-lg font-semibold text-blue-600">{stats.activeListings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Listings</span>
          <span className="text-lg font-semibold text-gray-900">{stats.totalListings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Transactions</span>
          <span className="text-lg font-semibold text-green-600">{stats.totalTransactions}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Volume</span>
          <span className="text-lg font-semibold text-purple-600">
            €{stats.totalVolume.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
} 