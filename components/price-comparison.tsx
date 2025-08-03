"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Truck, Clock, Euro, AlertCircle, CheckCircle } from "lucide-react"

interface PriceComparisonProps {
  gameName: string
  userPrice?: number
  showPricingSuggestion?: boolean
  compact?: boolean
}

interface StorePrice {
  name: string
  price: number
  url: string
  inStock: boolean
  shipping?: number
}

interface PriceData {
  minPrice: number
  maxPrice: number
  currency: string
  stores: StorePrice[]
  lastUpdated: string
}

export function PriceComparison({
  gameName,
  userPrice,
  showPricingSuggestion = false,
  compact = false,
}: PriceComparisonProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (gameName) {
      fetchPriceData()
    }
  }, [gameName])

  const fetchPriceData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/boardgameprices/search?query=${encodeURIComponent(gameName)}`)
      const data = await response.json()

      if (data.success && data.results.length > 0) {
        setPriceData(data.results[0])
      } else {
        setError("Price data not available")
      }
    } catch (err) {
      setError("Failed to load price data")
    } finally {
      setLoading(false)
    }
  }

  const calculateSavings = () => {
    if (!priceData || !userPrice) return null
    const savings = priceData.minPrice - userPrice
    const percentage = Math.round((savings / priceData.minPrice) * 100)
    return { amount: savings, percentage }
  }

  const getSuggestedPriceRange = () => {
    if (!priceData) return null
    const minSuggested = Math.round(priceData.minPrice * 0.5)
    const maxSuggested = Math.round(priceData.minPrice * 0.75)
    return { min: minSuggested, max: maxSuggested }
  }

  const getPriceStatus = () => {
    if (!priceData || !userPrice) return null
    const suggested = getSuggestedPriceRange()
    if (!suggested) return null

    if (userPrice < suggested.min) return { type: "low", message: "Priced below market range" }
    if (userPrice > suggested.max) return { type: "high", message: "Priced above typical used range" }
    return { type: "good", message: "Well priced for used condition" }
  }

  if (loading) {
    return (
      <Card className={compact ? "border-warm-yellow" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-vibrant-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading price data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !priceData) {
    return (
      <Card className={compact ? "border-warm-yellow" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Price comparison unavailable</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const savings = calculateSavings()
  const suggested = getSuggestedPriceRange()
  const priceStatus = getPriceStatus()

  if (compact) {
    return (
      <Card className="border-warm-yellow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Price Comparison</h4>
            <Badge className="bg-green-100 text-green-800 text-xs">
              New: €{priceData.minPrice}-{priceData.maxPrice}
            </Badge>
          </div>

          {savings && (
            <div className="flex items-center space-x-2 mb-3">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Save €{savings.amount.toFixed(2)} ({savings.percentage}%)
              </span>
            </div>
          )}

          <div className="text-xs text-gray-500">vs. buying new online + shipping</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Euro className="w-5 h-5 mr-2 text-vibrant-orange" />
          Price Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Market Prices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">New Game Prices:</span>
            <div className="text-right">
              <div className="font-bold text-lg">
                €{priceData.minPrice} - €{priceData.maxPrice}
              </div>
              <div className="text-xs text-gray-500">+ shipping</div>
            </div>
          </div>

          {userPrice && savings && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Your Savings:</span>
                <div className="text-right">
                  <div className="font-bold text-green-600">€{savings.amount.toFixed(2)}</div>
                  <div className="text-sm text-green-600">{savings.percentage}% off retail</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Store Listings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Available at:</h4>
          {priceData.stores.slice(0, 3).map((store, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{store.name}</span>
                {!store.inStock && (
                  <Badge variant="secondary" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">€{store.price}</div>
                {store.shipping && <div className="text-xs text-gray-500">+€{store.shipping} shipping</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Suggestion for Sellers */}
        {showPricingSuggestion && suggested && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-vibrant-orange" />
                Pricing Suggestion
              </h4>

              <div className="bg-warm-yellow/20 border border-warm-yellow rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Suggested used price:</span>
                  <span className="font-bold text-vibrant-orange">
                    €{suggested.min} - €{suggested.max}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Based on 50-75% of new retail price for used games</div>
              </div>

              {priceStatus && (
                <div
                  className={`flex items-center space-x-2 text-sm ${
                    priceStatus.type === "good"
                      ? "text-green-600"
                      : priceStatus.type === "high"
                        ? "text-orange-600"
                        : "text-blue-600"
                  }`}
                >
                  {priceStatus.type === "good" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{priceStatus.message}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Why Buy Used Benefits */}
        {userPrice && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Why buy used?</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-vibrant-orange" />
                  <span>Available immediately (no shipping wait)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3 h-3 text-vibrant-orange" />
                  <span>Local pickup saves shipping costs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-vibrant-orange" />
                  <span>Support local gaming community</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="text-xs text-gray-500 text-center">
          Price data from BoardGamePrices.eu • Updated {new Date(priceData.lastUpdated).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}
