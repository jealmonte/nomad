import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TripCard, type TripCardProps } from '@/components/cards/trips-card';
import { NewTripSheet } from '@/components/sheets/new-trip-sheet';
import { TripDetailSheet } from '@/components/sheets/trip-detail-sheet';

const images = {
  tokyo: require('@/assets/images/tokyo-skyline-night.png'),
  barcelona: require('@/assets/images/barcelona-sagrada-familia.png'),
  bali: require('@/assets/images/bali-rice-terraces.png'),
};

const tripsData: TripCardProps[] = [
  {
    id: 1,
    destination: 'Tokyo, Japan',
    image: images.tokyo,
    dates: 'Mar 15 - Mar 22, 2026',
    status: 'upcoming',
    daysCount: 7,
    spotsCount: 18,
  },
  {
    id: 2,
    destination: 'Barcelona, Spain',
    image: images.barcelona,
    dates: 'Dec 20 - Dec 27, 2025',
    status: 'past',
    daysCount: 7,
    spotsCount: 15,
  },
  {
    id: 3,
    destination: 'Bali, Indonesia',
    image: images.bali,
    dates: 'Sep 1 - Sep 10, 2025',
    status: 'past',
    daysCount: 9,
    spotsCount: 22,
  },
];

type ListItem = { type: 'content'; id: 'content' };
const listData: ListItem[] = [{ type: 'content', id: 'content' }];

export function TripsTab() {
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripCardProps | null>(null);

  const upcomingTrips = useMemo(() => tripsData.filter((t) => t.status === 'upcoming'), []);
  const pastTrips = useMemo(() => tripsData.filter((t) => t.status === 'past'), []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={listData}
        stickyHeaderIndices={[0]}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-6"
        ListHeaderComponent={
          <View className="bg-background py-3 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold tracking-tight text-foreground">Trips</Text>
                <Text className="text-sm text-muted-foreground">Plan your adventures</Text>
              </View>
              <Pressable
                onPress={() => setShowNewTrip(true)}
                className="h-10 w-10 rounded-full bg-primary items-center justify-center">
                <MaterialIcons name="add" size={20} color="#0f1116" />
              </Pressable>
            </View>
          </View>
        }
        renderItem={() => (
          <View className="py-4 gap-6">
            {upcomingTrips.length > 0 && (
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Feather name="calendar" size={18} color="#33d6b3" />
                  <Text className="text-lg font-semibold text-foreground">Upcoming</Text>
                </View>
                <View className="gap-3">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip.id} {...trip} onPress={() => setSelectedTrip(trip)} />
                  ))}
                </View>
              </View>
            )}

            {pastTrips.length > 0 && (
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Feather name="map-pin" size={18} color="#a6a6a6" />
                  <Text className="text-lg font-semibold text-foreground">Past Adventures</Text>
                </View>
                <View className="gap-3">
                  {pastTrips.map((trip) => (
                    <TripCard key={trip.id} {...trip} onPress={() => setSelectedTrip(trip)} />
                  ))}
                </View>
              </View>
            )}

            {tripsData.length === 0 && (
              <View className="items-center justify-center py-16">
                <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                  <Feather name="map-pin" size={28} color="#a6a6a6" />
                </View>
                <Text className="text-lg font-semibold text-foreground mb-2">No trips yet</Text>
                <Text className="text-muted-foreground mb-4">Start planning your next adventure</Text>
                <Pressable onPress={() => setShowNewTrip(true)} className="rounded-xl bg-secondary px-4 py-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="add" size={16} color="#fff" />
                    <Text className="text-secondary-foreground font-semibold">Plan a Trip</Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />

      <NewTripSheet open={showNewTrip} onOpenChange={setShowNewTrip} />
      <TripDetailSheet
        trip={selectedTrip}
        open={!!selectedTrip}
        onOpenChange={(open) => !open && setSelectedTrip(null)}
      />
    </SafeAreaView>
  );
}
