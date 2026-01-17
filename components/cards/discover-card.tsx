"use client"

import { MapPin, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface DiscoverCardProps {
  name: string
  location: string
  image: string
  aiScore: number
  distance: string
  tags: string[]
  matchReason: string
}

export function DiscoverCard({ name, location, image, aiScore, distance, tags, matchReason }: DiscoverCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover rounded-lg" />
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
            {aiScore}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold truncate pr-2">{name}</h3>
            <Bookmark className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
            <span>•</span>
            <span>{distance}</span>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-full px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Match Reason */}
          <p className="text-xs text-primary">{matchReason}</p>
        </div>
      </div>
    </Card>
  )
}
