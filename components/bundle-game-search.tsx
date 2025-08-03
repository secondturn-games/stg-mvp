"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { BGGSearch } from "./bgg-search"

interface BGGGameDetails {
  id: string
  name: string
  yearpublished: string
  minplayers: string
  maxplayers: string
  playingtime: string
  minage: string
  description: string
  thumbnail: string
  image: string
  rating: string
  weight: string
  rank: string
  mechanics: string[]
  categories: string[]
}

interface BundleGameSearchProps {
  onGameAdd: (game: BGGGameDetails) => void
  existingGames: BGGGameDetails[]
  isOpen: boolean
  onClose: () => void
}

export function BundleGameSearch({ onGameAdd, existingGames, isOpen, onClose }: BundleGameSearchProps) {
  const [selectedGame, setSelectedGame] = useState<BGGGameDetails | null>(null)

  const handleAddGame = () => {
    if (selectedGame && !existingGames.find((g) => g.id === selectedGame.id)) {
      onGameAdd(selectedGame)
      setSelectedGame(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Game to Bundle</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BGGSearch
            onGameSelect={setSelectedGame}
            selectedGameId={selectedGame?.id}
            gameType="bundle"
          />

          {selectedGame && (
            <Card className="border-warm-yellow relative">
              {/* Powered by BGG Logo */}
              <div className="absolute top-2 right-2 z-10">
                <a 
                  href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src="/powered-by-bgg-rgb.svg"
                    alt="Powered by BoardGameGeek"
                    className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start space-x-6">
                  {/* Left side: Thumbnail and technical details */}
                  <div className="flex-shrink-0">
                  {selectedGame.thumbnail && (
                    <img
                      src={selectedGame.thumbnail || "/placeholder.svg"}
                      alt={selectedGame.name}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0 shadow-sm mb-4"
                    />
                  )}
                    
                    {/* Technical details in a column */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Players:</span>
                        <span className="font-medium">{selectedGame.minplayers}-{selectedGame.maxplayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{selectedGame.playingtime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age:</span>
                        <span className="font-medium">{selectedGame.minage}+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">BGG Rating:</span>
                        <span className="font-medium">{Number.parseFloat(selectedGame.rating).toFixed(1)}/10</span>
                      </div>
                      {selectedGame.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight:</span>
                          <span className="font-medium">{Number.parseFloat(selectedGame.weight).toFixed(1)}/5</span>
                        </div>
                      )}
                      {selectedGame.rank && selectedGame.rank !== 'Not Ranked' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rank:</span>
                          <span className="font-medium">#{selectedGame.rank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Name, description, mechanics, categories */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">
                      {selectedGame.name} ({selectedGame.yearpublished})
                    </h3>

                    {/* Description */}
                    {selectedGame.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                          {selectedGame.description}
                        </p>
                      </div>
                    )}

                    {/* Mechanics */}
                    {selectedGame.mechanics && selectedGame.mechanics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-2">Mechanics:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedGame.mechanics.slice(0, 5).map((mechanic) => (
                          <Badge key={mechanic} variant="secondary" className="text-xs">
                            {mechanic}
                          </Badge>
                        ))}
                          {selectedGame.mechanics.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedGame.mechanics.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {selectedGame.categories && selectedGame.categories.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Categories:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedGame.categories.slice(0, 3).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs border-vibrant-orange text-vibrant-orange">
                              {category}
                            </Badge>
                          ))}
                          {selectedGame.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedGame.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGame}
              disabled={!selectedGame || !!existingGames.find((g) => g.id === selectedGame?.id)}
              className="bg-vibrant-orange hover:bg-vibrant-orange/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Bundle
            </Button>
          </div>

          {existingGames.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">Already in bundle:</h4>
              <div className="flex flex-wrap gap-2">
                {existingGames.map((game) => (
                  <Badge key={game.id} variant="secondary" className="text-xs">
                    {game.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
