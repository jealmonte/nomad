"use client"

import { useState } from "react"
import { Plus, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/cards/trip-card"
import { NewTripSheet } from "@/components/sheets/new-trip-sheet"
import { TripDetailSheet } from "@/components/sheets/trip-detail-sheet"

const tripsData = [
  {
    id: 1,
    destination: "Tokyo, Japan",
    image: "/tokyo-skyline-night.png",
    dates: "Mar 15 - Mar 22, 2026",
    status: "upcoming" as const,
    daysCount: 7,
    spotsCount: 18,
  },
  {
    id: 2,
    destination: "Barcelona, Spain",
    image: "/barcelona-sagrada-familia.png",
    dates: "Dec 20 - Dec 27, 2025",
    status: "past" as const,
    daysCount: 7,
    spotsCount: 15,
  },
  {
    id: 3,
    destination: "Bali, Indonesia",
    image: "/bali-rice-terraces.png",
    dates: "Sep 1 - Sep 10, 2025",
    status: "past" as const,
    daysCount: 9,
    spotsCount: 22,
  },
]

export function TripsTab() {
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<(typeof tripsData)[0] | null>(null)

  const upcomingTrips = tripsData.filter((t) => t.status === "upcoming")
  const pastTrips = tripsData.filter((t) => t.status === "past")

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
            <p className="text-sm text-muted-foreground">Plan your adventures</p>
          </div>
          <Button
            onClick={() => setShowNewTrip(true)}
            size="icon"
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} {...trip} onClick={() => setSelectedTrip(trip)} />
              ))}
            </div>
          </section>
        )}

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              Past Adventures
            </h2>
            <div className="space-y-3">
              {pastTrips.map((trip) => (
                <TripCard key={trip.id} {...trip} onClick={() => setSelectedTrip(trip)} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {tripsData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-4">Start planning your next adventure</p>
            <Button onClick={() => setShowNewTrip(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Plan a Trip
            </Button>
          </div>
        )}
      </div>

      <NewTripSheet open={showNewTrip} onOpenChange={setShowNewTrip} />
      <TripDetailSheet
        trip={selectedTrip}
        open={!!selectedTrip}
        onOpenChange={(open) => !open && setSelectedTrip(null)}
      />
    </div>
  )
}
