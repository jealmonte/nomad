"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface RankedSpotCardProps {
  rank: number
  name: string
  location: string
  image: string
  aiScore: number
  tag: string
}

export function RankedSpotCard({ rank, name, location, image, aiScore, tag }: RankedSpotCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
      {/* Rank */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
          rank === 1 && "bg-yellow-500/20 text-yellow-500",
          rank === 2 && "bg-gray-400/20 text-gray-400",
          rank === 3 && "bg-orange-600/20 text-orange-600",
          rank > 3 && "bg-muted text-muted-foreground",
        )}
      >
        {rank}
      </div>

      {/* Image */}
      <img src={image || "/placeholder.svg"} alt={name} className="w-12 h-12 rounded-lg object-cover" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{name}</h4>
        <p className="text-xs text-muted-foreground truncate">{location}</p>
      </div>

      {/* Score & Tag */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-primary font-bold text-sm">{aiScore}</span>
        <Badge variant="secondary" className="text-xs px-2 py-0 rounded-full">
          {tag}
        </Badge>
      </div>
    </div>
  )
}
