"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"

interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  average?: string
  type?: string
  alternateNames?: string[]
}

interface ExpansionSearchProps {
  baseGame: any
  onExpansionAdd: (expansion: BGGSearchResult) => void
  existingExpansions: BGGSearchResult[]
  isOpen: boolean
  onClose: () => void
}

export function ExpansionSearch({
  baseGame,
  onExpansionAdd,
  existingExpansions,
  isOpen,
  onClose,
}: ExpansionSearchProps) {
  const [availableExpansions, setAvailableExpansions] = useState<BGGSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpansionId, setSelectedExpansionId] = useState<string>("")

  // Fetch available expansions for the base game
  useEffect(() => {
    if (isOpen && baseGame) {
      fetchAvailableExpansions()
    }
  }, [isOpen, baseGame])

  const fetchAvailableExpansions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use multiple search strategies to find expansions
      const searchStrategies = [
        // Strategy 1: Search for "Game Name Expansion"
        `${baseGame.name} expansion`,
        // Strategy 2: Search for "Game Name Promo" 
        `${baseGame.name} promo`,
        // Strategy 3: Search for "Game Name Extension"
        `${baseGame.name} extension`,
        // Strategy 4: Search for just the game name with expansion type
        baseGame.name
      ]
      
      let allExpansions: BGGSearchResult[] = []
      
      for (const searchQuery of searchStrategies) {
        try {
          const response = await fetch(`/api/bgg/search?query=${encodeURIComponent(searchQuery)}&gameType=expansion`)
          const data = await response.json()
          
          if (data.success && data.results) {
            // Filter to only include actual expansions for this game
            const filteredResults = data.results.filter((result: BGGSearchResult) => {
              const resultName = result.name.toLowerCase()
              const baseGameName = baseGame.name.toLowerCase()
              
              // Exclude the base game itself
              if (resultName === baseGameName) return false
              
              // For the last strategy (just game name), be more strict
              if (searchQuery === baseGame.name) {
                return resultName.includes(baseGameName) && 
                       (resultName.includes('expansion') || 
                        resultName.includes('promo') || 
                        resultName.includes('extension') ||
                        resultName.includes('add-on'))
              }
              
              // For other strategies, be more lenient but still filter
              return resultName.includes(baseGameName) || 
                     (resultName.includes('expansion') && resultName.includes(baseGameName.split(' ')[0]))
            })
            
            allExpansions = [...allExpansions, ...filteredResults]
          }
        } catch (err) {
          console.warn(`Search strategy failed for "${searchQuery}":`, err)
          // Continue with other strategies
        }
      }
      
      // Remove duplicates based on ID
      const uniqueExpansions = allExpansions.filter((expansion, index, self) => 
        index === self.findIndex(e => e.id === expansion.id)
      )
      
      console.log(`Found ${uniqueExpansions.length} unique expansions for ${baseGame.name}:`, uniqueExpansions.map(e => e.name))
      
      // Filter out expansions that are already selected
      const availableResults = uniqueExpansions.filter((result: BGGSearchResult) => 
        !existingExpansions.some(existing => existing.id === result.id)
      )
      
      console.log(`Available expansions (after filtering selected):`, availableResults.map(e => e.name))
      
      setAvailableExpansions(availableResults)
      
      if (availableResults.length === 0) {
        setError("No expansions found for this game. This game may not have any expansions or promos available.")
      }
      
    } catch (err) {
      console.error('Error fetching expansions:', err)
      setError("Failed to fetch available expansions")
      setAvailableExpansions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpansionSelect = (expansionId: string) => {
    if (expansionId && expansionId !== "select") {
      const expansion = availableExpansions.find(e => e.id === expansionId)
      if (expansion) {
        onExpansionAdd(expansion)
        setSelectedExpansionId("")
      }
    }
  }

  const handleClose = () => {
    setSelectedExpansionId("")
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Expansion or Promo</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Game Info */}
          {baseGame && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-blue-800">Base Game:</span>
              </div>
              <p className="text-sm text-blue-700">
                {baseGame.name} ({baseGame.yearpublished})
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-vibrant-orange" />
              <span className="ml-2 text-gray-600">Loading available expansions...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Available Expansions Dropdown */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {availableExpansions.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Expansions & Promos:</Label>
                    <Select value={selectedExpansionId} onValueChange={handleExpansionSelect}>
                      <SelectTrigger className="border-warm-yellow focus:border-vibrant-orange">
                        <SelectValue placeholder="Select an expansion or promo to add" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select" disabled>
                          Choose an expansion...
                        </SelectItem>
                        {availableExpansions.map((expansion) => (
                          <SelectItem key={expansion.id} value={expansion.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{expansion.name}</span>
                              <div className="flex items-center space-x-2 ml-2">
                                {expansion.yearpublished && (
                                  <span className="text-xs text-gray-500">({expansion.yearpublished})</span>
                                )}
                                {expansion.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {expansion.type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Add Buttons for Popular Expansions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Add:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableExpansions.slice(0, 6).map((expansion) => (
                        <Button
                          key={expansion.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onExpansionAdd(expansion)}
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">{expansion.name}</div>
                            {expansion.yearpublished && (
                              <div className="text-xs text-gray-500">({expansion.yearpublished})</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No expansions found for "{baseGame?.name}"</p>
                  <p className="text-sm mt-1">This game may not have any expansions or promos available</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
