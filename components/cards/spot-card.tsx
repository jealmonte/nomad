"use client"

import { Heart, MessageCircle, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface SpotCardProps {
  user: {
    name: string
    avatar: string
    handle: string
  }
  spot: {
    name: string
    location: string
    image: string
    aiScore: number
    tags: string[]
  }
  review: string
  photos: number
  timestamp: string
}

export function SpotCard({ user, spot, review, photos, timestamp }: SpotCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border">
      {/* User Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
        <Bookmark className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Spot Image */}
      <div className="relative">
        <img src={spot.image || "/placeholder.svg"} alt={spot.name} className="w-full h-48 object-cover" />
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <span className="text-primary font-bold text-sm">{spot.aiScore}</span>
          <span className="text-xs text-muted-foreground">AI</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{spot.name}</h3>
            <p className="text-sm text-muted-foreground">{spot.location}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {spot.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs rounded-full px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Review */}
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">{review}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Comment</span>
          </button>
          {photos > 0 && <span className="text-xs text-muted-foreground ml-auto">+{photos} photos</span>}
        </div>
      </div>
    </Card>
  )
}
