"use client"

import { useState } from "react"
import { X, MapPin, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface NewTripSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const interests = ["temples", "food", "nightlife", "nature", "museums", "beaches", "shopping", "art"]

export function NewTripSheet({ open, onOpenChange }: NewTripSheetProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-background">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Plan a New Trip</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-6">
          {/* Destination */}
          <div>
            <label className="text-sm font-medium mb-2 block">Where to?</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Enter destination" className="pl-9 bg-muted border-none rounded-xl h-12" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" className="pl-9 bg-muted border-none rounded-xl h-12" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" className="pl-9 bg-muted border-none rounded-xl h-12" />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium mb-2 block">What are you interested in?</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "secondary"}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-sm"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI Generation Info */}
          <div className="bg-primary/10 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">AI-Powered Itinerary</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll create a personalized day-by-day itinerary based on your interests and travel style.
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Itinerary
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
