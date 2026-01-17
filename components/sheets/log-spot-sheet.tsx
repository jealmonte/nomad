"use client"

import { useState } from "react"
import { X, Camera, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface LogSpotSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tags = ["temples", "coffee", "food", "nightlife", "nature", "museums", "beaches", "markets"]

export function LogSpotSheet({ open, onOpenChange }: LogSpotSheetProps) {
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl bg-background">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Log a Spot</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-6">
          {/* Photo Upload */}
          <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border">
            <Camera className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Add photos</p>
          </div>

          {/* Spot Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Spot Name</label>
            <Input placeholder="Enter the name of the place" className="bg-muted border-none rounded-xl" />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="City, Country" className="pl-9 bg-muted border-none rounded-xl" />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    rating >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer rounded-full px-3 py-1.5"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review</label>
            <Textarea
              placeholder="Share your experience..."
              className="bg-muted border-none rounded-xl min-h-[100px] resize-none"
            />
          </div>

          {/* Submit */}
          <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground">Log This Spot</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
