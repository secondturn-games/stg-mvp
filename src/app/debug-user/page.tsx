'use client'

import { useAuth, useUser } from '@clerk/nextjs'

export default function DebugUserPage() {
  const { userId } = useAuth()
  const { user } = useUser()

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Debug User Information</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Clerk User Information</h2>
        
        <div className="space-y-4">
          <div>
            <strong>User ID:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
              {userId || 'Not available'}
            </code>
          </div>
          
          <div>
            <strong>Email:</strong> 
            <span className="ml-2">{user?.emailAddresses?.[0]?.emailAddress || 'Not available'}</span>
          </div>
          
          <div>
            <strong>Username:</strong> 
            <span className="ml-2">{user?.username || 'Not available'}</span>
          </div>
          
          <div>
            <strong>First Name:</strong> 
            <span className="ml-2">{user?.firstName || 'Not available'}</span>
          </div>
          
          <div>
            <strong>Last Name:</strong> 
            <span className="ml-2">{user?.lastName || 'Not available'}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Copy your <strong>User ID</strong> from above</li>
          <li>Go to your Supabase SQL Editor</li>
          <li>Run this SQL (replace with your actual User ID):</li>
        </ol>
        
        <div className="mt-4 p-4 bg-gray-100 rounded font-mono text-sm">
          <pre>{`UPDATE users 
SET clerk_id = '${userId || 'YOUR_USER_ID_HERE'}' 
WHERE email = 'your-email@example.com';`}</pre>
        </div>
        
        <p className="mt-4 text-sm text-gray-600">
          Replace 'your-email@example.com' with your actual email address.
        </p>
      </div>
    </div>
  )
} 