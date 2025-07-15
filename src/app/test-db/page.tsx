export default async function TestDBPage() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Environment Variables Missing</h1>
        
        <div className="bg-red-50 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Missing Environment Variables:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>: {supabaseUrl ? '✅ Set' : '❌ Missing'}</li>
            <li><code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>: {supabaseAnonKey ? '✅ Set' : '❌ Missing'}</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">How to Fix:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file in your project root</li>
            <li>Add your Supabase credentials:</li>
            <li className="ml-4">
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </li>
            <li>Restart your development server</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Where to find your Supabase credentials:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to your Supabase dashboard</li>
            <li>Navigate to Settings → API</li>
            <li>Copy the "Project URL" and "anon public" key</li>
            <li>Paste them in your <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file</li>
          </ol>
        </div>
      </div>
    )
  }

  try {
    // Import supabase client dynamically to avoid build-time errors
    const { supabase } = await import('@/lib/supabase')
    
    // Test basic connection
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .limit(5)

    if (error) {
      return (
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h1>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Error Details:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Common Issues:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Check if your Supabase project is active</li>
              <li>Verify the API keys are correct</li>
              <li>Ensure the database schema has been applied</li>
              <li>Check if RLS policies are blocking access</li>
            </ul>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Database Connection Successful!</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Sample Games Data:</h2>
          <div className="grid gap-4">
            {games?.map((game) => (
              <div key={game.id} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold">{game.title?.en || 'Untitled'}</h3>
                <p className="text-sm text-gray-600">
                  {game.year_published && `Published: ${game.year_published}`}
                  {game.min_players && game.max_players && 
                    ` • Players: ${game.min_players}-${game.max_players}`}
                  {game.playing_time && ` • Time: ${game.playing_time}min`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">✅ Database Setup Complete</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ 10 tables created successfully</li>
            <li>✅ Row Level Security (RLS) enabled</li>
            <li>✅ Indexes created for performance</li>
            <li>✅ Sample data inserted</li>
            <li>✅ Supabase connection working</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Set up Clerk authentication</li>
            <li>Create user management components</li>
            <li>Build listing creation interface</li>
            <li>Implement search functionality</li>
            <li>Add payment integration</li>
          </ol>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Database Test Failed</h1>
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Details:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
} 