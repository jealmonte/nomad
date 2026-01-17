"use client"

import { Settings, Share2, MapPin, Star, Globe, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RankedSpotCard } from "@/components/cards/ranked-spot-card"

const profileData = {
  name: "Alex Thompson",
  handle: "@alextravel",
  avatar: "/traveler-man-portrait.jpg",
  bio: "Exploring the world one spot at a time ✈️",
  stats: {
    countries: 24,
    cities: 67,
    spots: 342,
    avgScore: 8.4,
  },
  topTags: ["coffee", "temples", "food", "nature"],
  social: {
    followers: 1247,
    following: 389,
  },
}

const rankedSpots = [
  {
    rank: 1,
    name: "Fushimi Inari Shrine",
    location: "Kyoto, Japan",
    image: "/fushimi-inari-torii.jpg",
    aiScore: 9.8,
    tag: "temples",
  },
  {
    rank: 2,
    name: "Café Central",
    location: "Vienna, Austria",
    image: "/cafe-central-vienna.jpg",
    aiScore: 9.6,
    tag: "coffee",
  },
  {
    rank: 3,
    name: "Sukiyabashi Jiro",
    location: "Tokyo, Japan",
    image: "/sushi-restaurant-tokyo.jpg",
    aiScore: 9.5,
    tag: "food",
  },
  {
    rank: 4,
    name: "Plitvice Lakes",
    location: "Croatia",
    image: "/plitvice-lakes-waterfall.jpg",
    aiScore: 9.4,
    tag: "nature",
  },
  {
    rank: 5,
    name: "Angkor Wat",
    location: "Siem Reap, Cambodia",
    image: "/angkor-wat-sunrise.jpg",
    aiScore: 9.3,
    tag: "temples",
  },
]

export function ProfileTab() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-primary">
            <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <p className="text-muted-foreground text-sm">{profileData.handle}</p>
            <p className="text-sm mt-1">{profileData.bio}</p>
          </div>
        </div>

        {/* Social Stats */}
        <div className="flex gap-6">
          <button className="text-center">
            <p className="text-lg font-bold">{profileData.social.followers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button className="text-center">
            <p className="text-lg font-bold">{profileData.social.following}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.countries}</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.cities}</p>
                <p className="text-xs text-muted-foreground">Cities</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.spots}</p>
                <p className="text-xs text-muted-foreground">Spots Logged</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Tags */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">TASTE PROFILE</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.topTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ranked Spots */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Top Spots</h3>
          <div className="space-y-2">
            {rankedSpots.map((spot) => (
              <RankedSpotCard key={spot.rank} {...spot} />
            ))}
          </div>
        </div>

        {/* Invite Code */}
        <Card className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Invite Friends</p>
              <p className="text-sm text-muted-foreground">Share your invite code</p>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full">
              WANDR-{profileData.handle.slice(1, 5).toUpperCase()}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
