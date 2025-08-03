"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Lightbulb, CheckCircle, RefreshCw } from "lucide-react"

interface PricingWidgetProps {
  gameName: string
  currentPrice: string
  onPriceChange: (price: string) => void
}

export function PricingWidget({ gameName, currentPrice, onPriceChange }: PricingWidgetProps) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    if (gameName && gameName.length > 2) {
      fetchPriceData()
    }
  }, [gameName])

  const fetchPriceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/boardgameprices/search?query=${encodeURIComponent(gameName)}`)
      const data = await response.json()
      if (data.success && data.results.length > 0) {
        setPriceData(data.results[0])
        setShowSuggestion(true)
      }
    } catch (error) {
      console.error("Failed to fetch price data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSuggestedRange = () => {
    if (!priceData) return null
    const min = Math.round(priceData.minPrice * 0.5)
    const max = Math.round(priceData.minPrice * 0.75)
    return { min, max }
  }

  const getPriceAnalysis = () => {
    if (!priceData || !currentPrice) return null
    const price = Number.parseFloat(currentPrice)
    const suggested = getSuggestedRange()
    if (!suggested) return null

    if (price < suggested.min) {
      return {
        type: "low",
        icon: TrendingDown,
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        message: "Consider pricing higher - you might be undervaluing your game",
        suggestion: `Try €${suggested.min}-${suggested.max}`,
      }
    }

    if (price > suggested.max) {
      return {
        type: "high",
        icon: TrendingUp,
        color: "text-orange-600",
        bg: "bg-orange-50 border-orange-200",
        message: "Price might be too high for used condition",
        suggestion: `Consider €${suggested.min}-${suggested.max}`,
      }
    }

    return {
      type: "good",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      message: "Great pricing for a used game!",
      suggestion: null,
    }
  }

  const applySuggestedPrice = (price: number) => {
    onPriceChange(price.toString())
  }

  const suggested = getSuggestedRange()
  const analysis = getPriceAnalysis()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="price">Price (€) *</Label>
        <div className="relative">
          <Input
            id="price"
            type="number"
            placeholder="25"
            min="1"
            value={currentPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            className="border-warm-yellow focus:border-vibrant-orange"
          />
          {loading && (
            <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {priceData && showSuggestion && (
        <Card className="border-warm-yellow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-vibrant-orange" />
              <span className="font-medium text-sm">Smart Pricing</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>New retail price:</span>
                <span className="font-medium">
                  €{priceData.minPrice} - €{priceData.maxPrice}
                </span>
              </div>

              {suggested && (
                <div className="flex items-center justify-between text-sm">
                  <span>Suggested used price:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-vibrant-orange">
                      €{suggested.min} - €{suggested.max}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applySuggestedPrice(Math.round((suggested.min + suggested.max) / 2))}
                      className="text-xs px-2 py-1 h-auto"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {analysis && (
              <div className={`p-3 rounded-lg border ${analysis.bg}`}>
                <div className="flex items-start space-x-2">
                  <analysis.icon className={`w-4 h-4 mt-0.5 ${analysis.color}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${analysis.color}`}>{analysis.message}</p>
                    {analysis.suggestion && <p className="text-xs text-gray-600 mt-1">{analysis.suggestion}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {suggested &&
                [suggested.min, Math.round((suggested.min + suggested.max) / 2), suggested.max].map((price) => (
                  <Button
                    key={price}
                    size="sm"
                    variant="outline"
                    onClick={() => applySuggestedPrice(price)}
                    className="text-xs border-warm-yellow hover:bg-warm-yellow/20"
                  >
                    €{price}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
