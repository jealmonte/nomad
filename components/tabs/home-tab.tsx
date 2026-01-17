"use client"

import { useState } from "react"
import { Plus, Sparkles, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpotCard } from "@/components/cards/spot-card"
import { LogSpotSheet } from "@/components/sheets/log-spot-sheet"

const feedData = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/diverse-woman-avatar.png", handle: "@sarahc" },
    spot: {
      name: "Senso-ji Temple",
      location: "Tokyo, Japan",
      image: "/senso-ji-temple-tokyo.jpg",
      aiScore: 9.2,
      tags: ["temples", "culture", "must-see"],
    },
    review:
      "Absolutely magical at sunrise. The crowds are minimal and the light is perfect for photos. Don't skip the nearby street food!",
    photos: 3,
    timestamp: "2h ago",
  },
  {
    id: 2,
    user: { name: "Marco Rivera", avatar: "/man-avatar-beard.png", handle: "@marco_travels" },
    spot: {
      name: "Café de Flore",
      location: "Paris, France",
      image: "/cafe-de-flore-paris.jpg",
      aiScore: 8.7,
      tags: ["coffee", "iconic", "breakfast"],
    },
    review: "Classic Parisian vibes. The hot chocolate is legendary but pricey. Perfect for people watching.",
    photos: 2,
    timestamp: "5h ago",
  },
  {
    id: 3,
    user: { name: "Emma Wilson", avatar: "/woman-blonde-avatar.jpg", handle: "@emma.w" },
    spot: {
      name: "Fushimi Inari Shrine",
      location: "Kyoto, Japan",
      image: "/fushimi-inari-shrine-gates.jpg",
      aiScore: 9.5,
      tags: ["temples", "hiking", "photography"],
    },
    review:
      "The hike through thousands of torii gates is surreal. Go early morning to beat the crowds - totally worth the early wake up!",
    photos: 5,
    timestamp: "1d ago",
  },
]

export function HomeTab() {
  const [showLogSpot, setShowLogSpot] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nomad</h1>
            <p className="text-sm text-muted-foreground">Your travel feed</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="sr-only">Get Lucky</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowLogSpot(true)}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log a Spot
          </Button>
          <Button variant="secondary" className="flex-1 rounded-xl h-12">
            <Sparkles className="w-5 h-5 mr-2" />
            Get Lucky
          </Button>
          <Button variant="secondary" className="rounded-xl h-12 px-4">
            <Plane className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4 pb-4">
        {feedData.map((item) => (
          <SpotCard key={item.id} {...item} />
        ))}
      </div>

      <LogSpotSheet open={showLogSpot} onOpenChange={setShowLogSpot} />
    </div>
  )
}
