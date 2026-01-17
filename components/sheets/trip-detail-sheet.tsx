"use client"

import { X, MapPin, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface TripDetailSheetProps {
  trip: {
    id: number
    destination: string
    image: string
    dates: string
    status: "upcoming" | "past"
    daysCount: number
    spotsCount: number
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const itinerary = [
  {
    day: 1,
    date: "Mar 15",
    activities: [
      { time: "Morning", spot: "Senso-ji Temple", type: "temples" },
      { time: "Afternoon", spot: "Nakamise Shopping Street", type: "shopping" },
      { time: "Evening", spot: "Shibuya Crossing", type: "sightseeing" },
    ],
  },
  {
    day: 2,
    date: "Mar 16",
    activities: [
      { time: "Morning", spot: "Tsukiji Outer Market", type: "food" },
      { time: "Afternoon", spot: "teamLab Borderless", type: "museums" },
      { time: "Evening", spot: "Golden Gai", type: "nightlife" },
    ],
  },
  {
    day: 3,
    date: "Mar 17",
    activities: [
      { time: "Morning", spot: "Meiji Shrine", type: "temples" },
      { time: "Afternoon", spot: "Harajuku", type: "shopping" },
      { time: "Evening", spot: "Robot Restaurant", type: "nightlife" },
    ],
  },
]

export function TripDetailSheet({ trip, open, onOpenChange }: TripDetailSheetProps) {
  if (!trip) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl bg-background p-0">
        {/* Header Image */}
        <div className="relative h-48">
          <img src={trip.image || "/placeholder.svg"} alt={trip.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold">{trip.destination}</h2>
            <p className="text-sm text-muted-foreground">{trip.dates}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 12rem)" }}>
          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{trip.spotsCount} spots</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{trip.daysCount} days</span>
            </div>
          </div>

          {/* AI Generated Badge */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Generated Itinerary</span>
          </div>

          {/* Itinerary */}
          <div className="space-y-6">
            {itinerary.map((day) => (
              <div key={day.day}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {day.day}
                  </span>
                  <span className="font-semibold">Day {day.day}</span>
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                </div>
                <div className="space-y-2 pl-10">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <p className="font-medium text-sm">{activity.spot}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs rounded-full">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Button */}
          <Button variant="secondary" className="w-full h-12 rounded-xl">
            Edit Itinerary
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
