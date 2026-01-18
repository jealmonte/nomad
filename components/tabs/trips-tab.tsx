"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Plus, Calendar, MapPin } from "lucide-react-native"
import { TripCard } from "@/components/cards/trip-card"
import { NewTripSheet } from "@/components/sheets/new-trip-sheet"
import { TripDetailSheet } from "@/components/sheets/trip-detail-sheet"

const tripsData = [
  {
    id: 1,
    destination: "Tokyo, Japan",
    image: require("../../public/tokyo-skyline-night.png"),
    dates: "Mar 15 - Mar 22, 2026",
    status: "upcoming" as const,
    daysCount: 7,
    spotsCount: 18,
  },
  {
    id: 2,
    destination: "Barcelona, Spain",
    image: require("../../public/barcelona-sagrada-familia.png"),
    dates: "Dec 20 - Dec 27, 2025",
    status: "past" as const,
    daysCount: 7,
    spotsCount: 15,
  },
  {
    id: 3,
    destination: "Bali, Indonesia",
    image: require("../../public/bali-rice-terraces.png"),
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Trips</Text>
            <Text style={styles.headerSubtitle}>Plan your adventures</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowNewTrip(true)}
            style={styles.addButton}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#8A2BE2" />
              <Text style={styles.sectionTitle}>Upcoming</Text>
            </View>
            <View style={styles.cardContainer}>
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} {...trip} onPress={() => setSelectedTrip(trip)} />
              ))}
            </View>
          </View>
        )}

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#666" />
              <Text style={styles.sectionTitle}>Past Adventures</Text>
            </View>
            <View style={styles.cardContainer}>
              {pastTrips.map((trip) => (
                <TripCard key={trip.id} {...trip} onPress={() => setSelectedTrip(trip)} />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {tripsData.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <MapPin size={32} color="#666" />
            </View>
            <Text style={styles.emptyStateTitle}>No trips yet</Text>
            <Text style={styles.emptyStateSubtitle}>Start planning your next adventure</Text>
            <TouchableOpacity onPress={() => setShowNewTrip(true)} style={styles.planTripButton}>
              <Plus size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{color: "#fff"}}>Plan a Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <NewTripSheet open={showNewTrip} onOpenChange={setShowNewTrip} />
      <TripDetailSheet
        trip={selectedTrip}
        open={!!selectedTrip}
        onOpenChange={(open) => !open && setSelectedTrip(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    borderRadius: 9999,
    backgroundColor: '#8A2BE2',
    color: '#fff',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardContainer: {
    gap: 12,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#f1f1f1',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  planTripButton: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 16,
    paddingVertical: 10,
  }
});