'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        // Try to sync when back online
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('background-sync')
        }).catch(console.error)
      }
      // Reload the page to try again
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-light-beige flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-l-4 border-l-vibrant-orange bg-warm-yellow/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <WifiOff className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            <CardTitle className="text-dark-green text-xl">You're Offline</CardTitle>
            <CardDescription className="text-gray-600">
              No internet connection detected. Some features may not be available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>You can still:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Browse previously viewed games</li>
                <li>View cached listings</li>
                <li>Navigate through the app</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleRetry}
                className="bg-vibrant-orange hover:bg-vibrant-orange/90 w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full border-warm-yellow text-dark-green hover:bg-warm-yellow/10">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
            
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-100">
              <p>Second Turn works best with an internet connection.</p>
              <p>Please check your network and try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
