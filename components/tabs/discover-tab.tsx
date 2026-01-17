"use client"

import { useState } from "react"
import { Search, Sparkles, MapPin, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DiscoverCard } from "@/components/cards/discover-card"

const tags = ["temples", "nightlife", "coffee", "beaches", "nature", "food", "museums", "markets"]

const recommendations = [
  {
    id: 1,
    name: "Tsukiji Outer Market",
    location: "Tokyo, Japan",
    image: "/tsukiji-fish-market-tokyo.jpg",
    aiScore: 9.1,
    distance: "2.3 km",
    tags: ["food", "markets", "breakfast"],
    matchReason: "Based on your love for food markets",
  },
  {
    id: 2,
    name: "Golden Gai",
    location: "Shinjuku, Tokyo",
    image: "/golden-gai-tokyo-nightlife.jpg",
    aiScore: 8.9,
    distance: "4.1 km",
    tags: ["nightlife", "bars", "authentic"],
    matchReason: "Friends rated this highly",
  },
  {
    id: 3,
    name: "teamLab Borderless",
    location: "Tokyo, Japan",
    image: "/teamlab-borderless-digital-art.jpg",
    aiScore: 9.4,
    distance: "8.2 km",
    tags: ["museums", "art", "immersive"],
    matchReason: "Trending with travelers like you",
  },
  {
    id: 4,
    name: "Meiji Shrine",
    location: "Shibuya, Tokyo",
    image: "/meiji-shrine-tokyo-forest.jpg",
    aiScore: 8.8,
    distance: "5.6 km",
    tags: ["temples", "nature", "peaceful"],
    matchReason: "You liked similar temples",
  },
]

export function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-2xl font-bold tracking-tight mb-3">Discover</h1>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Find a spot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-none rounded-xl h-11"
              />
            </div>
            <Button variant="secondary" size="icon" className="rounded-xl h-11 w-11">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Get Lucky Button */}
      <div className="px-4 py-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14 text-base font-semibold">
          <Sparkles className="w-5 h-5 mr-2" />
          Get Lucky - Surprise Me!
        </Button>
      </div>

      {/* Tags Filter */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className="cursor-pointer rounded-full px-3 py-1.5 whitespace-nowrap transition-colors"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Current Location */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Near Tokyo, Japan</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-4 space-y-4 pb-4">
        <h2 className="text-lg font-semibold">Recommended for You</h2>
        {recommendations.map((spot) => (
          <DiscoverCard key={spot.id} {...spot} />
        ))}
      </div>
    </div>
  )
}
