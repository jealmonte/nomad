"use client"

import { Calendar, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TripCardProps {
  destination: string
  image: string
  dates: string
  status: "upcoming" | "past"
  daysCount: number
  spotsCount: number
  onClick: () => void
}

export function TripCard({ destination, image, dates, status, daysCount, spotsCount, onClick }: TripCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden bg-card border-border cursor-pointer transition-transform active:scale-[0.98]",
        status === "past" && "opacity-80",
      )}
      onClick={onClick}
    >
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={destination} className="w-full h-32 object-cover" />
        {status === "upcoming" && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Upcoming</Badge>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{destination}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              <span>{dates}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex gap-3 mt-3 pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{daysCount}</span> days
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{spotsCount}</span> spots
          </span>
        </div>
      </div>
    </Card>
  )
}
