'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  MapPin, 
  Euro, 
  Calendar, 
  Users, 
  Cake, 
  Clock, 
  Star, 
  Heart, 
  MessageCircle, 
  Flag,
  Shield,
  Truck,
  Package
} from 'lucide-react'

import type { Listing } from '@/types'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const listingId = params.id as string

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch listing')
        }

        setListing(result.listing)
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError(err instanceof Error ? err.message : 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    if (listingId) {
      fetchListing()
    }
  }, [listingId])

  // Helper function to get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new-in-shrink': return 'bg-green-100 text-green-800'
      case 'like-new': return 'bg-green-100 text-green-800'
      case 'excellent': return 'bg-blue-100 text-blue-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'fair': return 'bg-orange-100 text-orange-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to format condition label
  const formatCondition = (condition: string) => {
    return condition.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Helper function to get shipping method labels
  const getShippingLabels = (methods: string[]) => {
    const labels: { [key: string]: string } = {
      'local-pickup': 'Local Pickup',
      'national-standard': 'National Standard',
      'national-express': 'National Express',
      'eu-standard': 'EU Standard',
      'eu-express': 'EU Express',
      'worldwide': 'Worldwide'
    }
    return methods.map(method => labels[method] || method)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-orange mx-auto"></div>
              <p className="mt-4 text-dark-green">Loading listing...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-700">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-light-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Listing Not Found</CardTitle>
                <CardDescription>The listing you're looking for doesn't exist.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/games')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-beige">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/games" 
            className="text-vibrant-orange hover:text-vibrant-orange/80 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Image and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Game Image */}
                  <div className="md:w-48 flex-shrink-0">
                    {listing.bgg_data?.image ? (
                      <Image
                        src={listing.bgg_data.image}
                        alt={listing.title}
                        width={200}
                        height={200}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Game Details */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-dark-green mb-2">
                      {listing.title}
                    </h1>
                    
                    {/* Game Meta Info */}
                    {listing.bgg_data && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {listing.bgg_data.yearpublished && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {listing.bgg_data.yearpublished}
                          </div>
                        )}
                        {listing.bgg_data.minplayers && listing.bgg_data.maxplayers && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {listing.bgg_data.minplayers === listing.bgg_data.maxplayers 
                              ? `${listing.bgg_data.minplayers} players`
                              : `${listing.bgg_data.minplayers}-${listing.bgg_data.maxplayers} players`
                            }
                          </div>
                        )}
                        {listing.bgg_data.minage && (
                          <div className="flex items-center gap-1">
                            <Cake className="w-4 h-4" />
                            {listing.bgg_data.minage}+ years
                          </div>
                        )}
                        {listing.bgg_data.playingtime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {listing.bgg_data.playingtime} min
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price and Condition */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="text-3xl font-bold text-vibrant-orange">
                        €{listing.price}
                      </div>
                      <Badge className={getConditionColor(listing.condition)}>
                        {formatCondition(listing.condition)}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {listing.sale_type.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      {listing.city}, {listing.country}
                      {listing.local_area && ` (${listing.local_area})`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{listing.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping Methods */}
                <div>
                  <h4 className="font-medium text-dark-green mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping Options
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getShippingLabels(listing.shipping_methods).map((method, index) => (
                      <Badge key={index} variant="secondary">
                        {method}
                        {listing.shipping_costs[listing.shipping_methods[index]] && 
                          ` - €${listing.shipping_costs[listing.shipping_methods[index]]}`
                        }
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Extras */}
                {listing.extras_categories.length > 0 && (
                  <div>
                    <h4 className="font-medium text-dark-green mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Extras & Add-ons
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {listing.extras_categories.map((extra, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {extra}
                        </Badge>
                      ))}
                    </div>
                    {listing.extras_notes && (
                      <p className="mt-2 text-sm text-gray-600">{listing.extras_notes}</p>
                    )}
                  </div>
                )}

                {/* Condition Notes */}
                {listing.condition_notes && (
                  <div>
                    <h4 className="font-medium text-dark-green mb-2">Condition Notes</h4>
                    <p className="text-sm text-gray-600">{listing.condition_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={listing.users?.avatar} />
                    <AvatarFallback>
                      {listing.users?.full_name?.charAt(0) || listing.users?.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-dark-green">
                      {listing.users?.full_name || listing.users?.username}
                      {listing.users?.is_verified && (
                        <Shield className="w-4 h-4 inline ml-1 text-blue-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {listing.users?.city}, {listing.users?.country}
                    </div>
                  </div>
                </div>

                {/* Seller Stats */}
                {listing.users?.rating && (
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {listing.users.rating}/5.0 ({listing.users.review_count} reviews)
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Flag className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <div>Listed: {new Date(listing.created_at).toLocaleDateString()}</div>
                <div>Views: {listing.view_count}</div>
                <div>ID: {listing.id}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
