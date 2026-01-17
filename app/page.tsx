"use client"

import { useState } from "react"
import { HomeTab } from "@/components/tabs/home-tab"
import { DiscoverTab } from "@/components/tabs/discover-tab"
import { TripsTab } from "@/components/tabs/trips-tab"
import { ProfileTab } from "@/components/tabs/profile-tab"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "trips" | "profile">("home")

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto relative">
      <main className="pb-20">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "discover" && <DiscoverTab />}
        {activeTab === "trips" && <TripsTab />}
        {activeTab === "profile" && <ProfileTab />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
