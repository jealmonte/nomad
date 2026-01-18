"use client"

import { Calendar, ChevronRight } from "lucide-react-native"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"

interface TripCardProps {
  destination: string
  image: any // Changed to any to support require
  dates: string
  status: "upcoming" | "past"
  daysCount: number
  spotsCount: number
  onPress: () => void
}

export function TripCard({ destination, image, dates, status, daysCount, spotsCount, onPress }: TripCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, status === "past" && styles.pastCard]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        {status === "upcoming" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Upcoming</Text>
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.destination}>{destination}</Text>
            <View style={styles.dateContainer}>
              <Calendar width={12} height={12} color="#666" />
              <Text style={styles.dateText}>{dates}</Text>
            </View>
          </View>
          <ChevronRight width={20} height={20} color="#666" />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerValue}>{daysCount}</Text> days
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerValue}>{spotsCount}</Text> spots
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  pastCard: {
    opacity: 0.8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 128,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 12,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destination: {
    fontWeight: '600',
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerValue: {
    color: '#000',
    fontWeight: '500',
  },
})