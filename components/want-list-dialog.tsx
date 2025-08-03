"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin, Euro, Star } from "lucide-react"
import Image from "next/image"

interface WantListDialogProps {
  isOpen: boolean
  onClose: () => void
  gameTitle: string
  gameImage: string
}

export function WantListDialog({ isOpen, onClose, gameTitle, gameImage }: WantListDialogProps) {
  const [maxPrice, setMaxPrice] = useState("")
  const [preferredLocations, setPreferredLocations] = useState<string[]>([])
  const [minCondition, setMinCondition] = useState("good")
  const [includeExpansions, setIncludeExpansions] = useState(false)
  const [notes, setNotes] = useState("")
  const [alertFrequency, setAlertFrequency] = useState("immediately")

  const locations = ["Estonia", "Latvia", "Lithuania", "Finland"]
  const conditions = [
    { value: "fair", label: "Fair or better" },
    { value: "good", label: "Good or better" },
    { value: "very-good", label: "Very Good or better" },
    { value: "like-new", label: "Like New or better" },
    { value: "new", label: "New only" },
  ]

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setPreferredLocations([...preferredLocations, location])
    } else {
      setPreferredLocations(preferredLocations.filter((l) => l !== location))
    }
  }

  const handleSubmit = () => {
    // Here you would submit the want list alert
    console.log({
      gameTitle,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      preferredLocations,
      minCondition,
      includeExpansions,
      notes,
      alertFrequency,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-vibrant-orange" />
            Create Alert for {gameTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Preview */}
          <div className="flex items-center gap-3 p-3 bg-light-beige rounded-lg">
            <Image
              src={gameImage || "/placeholder.svg"}
              alt={gameTitle}
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div>
              <h4 className="font-medium">{gameTitle}</h4>
              <p className="text-sm text-gray-600">You'll be notified when this game becomes available</p>
            </div>
          </div>

          {/* Price Limit */}
          <div className="space-y-2">
            <Label htmlFor="max-price" className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Maximum Price (optional)
            </Label>
            <Input
              id="max-price"
              type="number"
              placeholder="e.g. 45"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <p className="text-xs text-gray-500">Leave empty to get notified of any listing</p>
          </div>

          {/* Preferred Locations */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Preferred Locations
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={location}
                    checked={preferredLocations.includes(location)}
                    onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                  />
                  <Label htmlFor={location} className="text-sm">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
            {preferredLocations.length === 0 && <p className="text-xs text-gray-500">All locations will be included</p>}
          </div>

          {/* Minimum Condition */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Condition
            </Label>
            <Select value={minCondition} onValueChange={setMinCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Expansions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="expansions"
              checked={includeExpansions}
              onCheckedChange={(checked) => setIncludeExpansions(checked as boolean)}
            />
            <Label htmlFor="expansions" className="text-sm">
              Also notify me about expansion-only listings
            </Label>
          </div>

          {/* Alert Frequency */}
          <div className="space-y-2">
            <Label>Alert Frequency</Label>
            <Select value={alertFrequency} onValueChange={setAlertFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">Immediately</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
                <SelectItem value="weekly">Weekly digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Looking for English edition, prefer with expansions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Selected Criteria Summary */}
          {(maxPrice || preferredLocations.length > 0 || minCondition !== "good") && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Alert Criteria:</h4>
              <div className="flex flex-wrap gap-1">
                {maxPrice && (
                  <Badge variant="secondary" className="text-xs">
                    Max €{maxPrice}
                  </Badge>
                )}
                {preferredLocations.map((location) => (
                  <Badge key={location} variant="secondary" className="text-xs">
                    {location}
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-xs">
                  {conditions.find((c) => c.value === minCondition)?.label}
                </Badge>
                {includeExpansions && (
                  <Badge variant="secondary" className="text-xs">
                    Include expansions
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-vibrant-orange hover:bg-vibrant-orange/90">
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
