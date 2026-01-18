import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DiscoverCard, type DiscoverCardProps } from '@/components/cards/discover-card';
import { getLucky } from '@/services/woodwide';
import * as Localization from 'expo-localization';

const tags = ['temples', 'nightlife', 'coffee', 'beaches', 'nature', 'food', 'museums', 'markets'];

const images = {
  canton: require('@/assets/images/canton-avenue.png'),
  cathedral: require('@/assets/images/cathedral-of-learning.png'),
  childrens: require('@/assets/images/childrens-museum.png'),
  garden: require('@/assets/images/garden.png'),
  aviary: require('@/assets/images/national-aviary.png'),
  strip: require('@/assets/images/strip-district.png'),
};

const recommendations: DiscoverCardProps[] = [
  {
    id: 1,
    name: 'Canton Avenue',
    location: 'Beechview',
    image: images.canton,
    aiScore: 8.3,
    distance: '6.8 mi',
    tags: ['outdoors', 'photo'],
    matchReason: 'Iconic super-steep street and a quick, quirky photo stop',
  },
  {
    id: 2,
    name: 'Phipps Conservatory and Botanical Gardens',
    location: '1 Schenley Dr',
    image: images.garden,
    aiScore: 9.4,
    distance: '0.2 mi',
    tags: ['nature', 'gardens'],
    matchReason: 'Gorgeous glasshouse gardens and seasonal exhibits year-round',
  },
  {
    id: 3,
    name: 'Cathedral of Learning',
    location: '4200 Fifth Ave',
    image: images.cathedral,
    aiScore: 9.2,
    distance: '0.3 mi',
    tags: ['architecture', 'history'],
    matchReason: 'Pittsburgh’s signature skyline icon with stunning Gothic interiors and the Nationality Rooms',
  },
  {
    id: 4,
    name: 'Strip District',
    location: '120 Fifth Avenue',
    image: images.strip,
    aiScore: 8.9,
    distance: '3.0 mi',
    tags: ['food', 'markets'],
    matchReason: 'Lively food markets and local shops; great for sampling Pittsburgh staples',
  },
  {
    id: 5,
    name: 'Children’s Museum of Pittsburgh',
    location: 'Beechview',
    image: images.childrens,
    aiScore: 8.8,
    distance: '5.2 mi',
    tags: ['museums', 'family'],
    matchReason: 'Hands‑on exhibits and creative play spaces that are fun even for adults',
  },
  {
    id: 6,
    name: 'National Aviary',
    location: '700 Arch Street',
    image: images.aviary,
    aiScore: 9.0,
    distance: '6.8 mi',
    tags: ['nature', 'wildlife'],
    matchReason: 'World‑class bird sanctuary with immersive walkthroughs and live encounters',
  },
];

const liveEvents = [
  {
    id: 'locomotion-weekend',
    title: 'Locomotion Weekend',
    venue: 'Kamin Science Center',
    location: 'One Allegheny Ave',
    time: '10 AM – 4 PM',
    tag: 'family',
  },
  {
    id: 'united-we-dance',
    title: 'United We Dance: The Ultimate Rave Experience',
    venue: 'Enclave',
    location: 'Pittsburgh',
    time: '9 PM',
    tag: 'music',
  },
  {
    id: 'dinosaur-world-live',
    title: 'Dinosaur World Live',
    venue: 'Byham Theater',
    location: '101 6th St',
    time: '11 AM – 2 PM',
    tag: 'family',
  },
];

function LiveEventCard({
  title,
  venue,
  time,
  tag,
  onPress,
}: {
  title: string;
  venue: string;
  time: string;
  tag: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 min-w-0 bg-card border border-border rounded-xl p-3">
      <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={2}>
        {title}
      </Text>
      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
        {venue}
      </Text>
      <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
        {time}
      </Text>
      <View className="mt-2 self-start bg-secondary rounded-full px-2 py-1">
        <Text className="text-xs text-secondary-foreground">{tag}</Text>
      </View>
    </Pressable>
  );
}

const locale = Localization.getLocales()[0];
const region = locale?.regionCode;

const locationLabel = (() => {
  if (region === 'US') return 'Near Pittsburgh, PA';
  if (!region) return 'Near you';

  const name =
    typeof Intl !== 'undefined' && (Intl as any).DisplayNames
      ? new Intl.DisplayNames([locale?.languageTag ?? 'en'], { type: 'region' }).of(region)
      : region;

  return `Near ${name ?? region}`;
})();


export function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 2. Add state for the Get Lucky feature
  const [isLuckyLoading, setIsLuckyLoading] = useState(false);
  const [luckySpot, setLuckySpot] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<(typeof liveEvents)[number] | null>(null);

  const eventScale = useSharedValue(0.9);
  const eventOpacity = useSharedValue(0);
  const eventModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eventScale.value }],
    opacity: eventOpacity.value,
  }));

  useEffect(() => {
    if (!selectedEvent) return;
    eventScale.value = 0.9;
    eventOpacity.value = 0;
    eventScale.value = withSpring(1, { damping: 14, stiffness: 150 });
    eventOpacity.value = withTiming(1, { duration: 150 });
  }, [selectedEvent, eventOpacity, eventScale]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // 3. Handler to call WoodWide AI
  const handleGetLucky = async () => {
    setIsLuckyLoading(true);
    setLuckySpot(null);

    try {
      // Call the service
      const spot = await getLucky();

      // Calculate display score (e.g. 0.99 -> 99)
      const rawScore = (spot.compatibilityScore || 0) * 100;
      const displayScore = rawScore > 99 ? 99 : rawScore.toFixed(0);

      // Prepare the data for the modal
      // Note: Since the AI returns data without local image paths, 
      // we'll assign a random image from our assets for the demo to look nice.
      const randomImageKey = Object.keys(images)[Math.floor(Math.random() * Object.keys(images).length)] as keyof typeof images;

      setLuckySpot({
        ...spot,
        image: images[randomImageKey],
        matchReason: `AI Match: ${displayScore}%`,
        distance: typeof spot.distance === 'number' ? `${spot.distance} km` : spot.distance,
      });

    } catch (e: any) {
      console.error(e);
      Alert.alert("AI Error", "Could not find a lucky spot. Please try again.");
    } finally {
      setIsLuckyLoading(false);
    }
  };

  const recommendedIds = new Set([2, 3]);

  const filterSpot = (spot: DiscoverCardProps) => {
    const matchesQuery =
      !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => spot.tags.includes(tag));
    return matchesQuery && matchesTags;
  };

  const filteredRecommended = useMemo(
    () => recommendations.filter((spot) => recommendedIds.has(spot.id) && filterSpot(spot)),
    [searchQuery, selectedTags]
  );
  const filteredPopular = useMemo(
    () => recommendations.filter((spot) => !recommendedIds.has(spot.id) && filterSpot(spot)),
    [searchQuery, selectedTags]
  );

  type ListItem = { type: 'intro'; id: 'intro' } | DiscoverCardProps;
  const listData: ListItem[] = [{ type: 'intro', id: 'intro' }, ...filteredRecommended];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={listData}
        stickyHeaderIndices={[0]}
        keyExtractor={(item) => ('type' in item ? item.id : String(item.id))}
        contentContainerClassName="px-4 pb-6"
        ListHeaderComponent={
          <View className="bg-background pt-2 pb-3 border-b border-border">
            <Text className="text-2xl font-bold tracking-tight text-foreground mb-3">Discover</Text>

            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center bg-muted rounded-xl h-11 px-3">
                <Feather name="search" size={16} color="#a6a6a6" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Find a spot..."
                  placeholderTextColor="#a6a6a6"
                  className="flex-1 ml-2 text-foreground"
                />
              </View>
              <Pressable className="rounded-xl h-11 w-11 items-center justify-center bg-secondary">
                <MaterialIcons name="tune" size={18} color="#fff" />
              </Pressable>
            </View>

            <View className="pt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 pb-1">
                  {tags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1.5 ${active ? 'bg-primary' : 'bg-secondary'}`}>
                        <Text className={active ? 'text-primary-foreground text-xs' : 'text-secondary-foreground text-xs'}>
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if ('type' in item) {
            return (
              <View className="pt-4">
                {/* 4. Update the Button to be interactive */}
                <Pressable
                  onPress={handleGetLucky}
                  disabled={isLuckyLoading}
                  className={`w-full rounded-xl h-14 items-center justify-center flex-row ${isLuckyLoading ? 'bg-primary/80' : 'bg-primary'}`}
                >
                  {isLuckyLoading ? (
                    <ActivityIndicator color="#0f1116" />
                  ) : (
                    <>
                      <MaterialIcons name="auto-awesome" size={20} color="#0f1116" />
                      <Text className="ml-2 text-primary-foreground text-base font-semibold">
                        Get Lucky - Surprise Me!
                      </Text>
                    </>
                  )}
                </Pressable>

                <View className="flex-row items-center justify-between mt-4 mb-2">
                  <Text className="text-lg font-semibold text-foreground mb-1">Live Events</Text>
                  <View className="flex-row items-center gap-2">
                    <Feather name="map-pin" size={16} color="#33d6b3" />
                    <Text className="text-sm text-muted-foreground">{locationLabel}</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  {liveEvents.map((ev) => (
                    <LiveEventCard key={ev.id} {...ev} onPress={() => setSelectedEvent(ev)} />
                  ))}
                </View>

                <Text className="text-lg font-semibold text-foreground mb-3 mt-3">Recommended for You</Text>
              </View>
            );
          }
          return <DiscoverCard {...item} />;
        }}
        ListFooterComponent={
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Popular in Pittsburgh</Text>
            <View>
              {filteredPopular.map((spot) => (
                <DiscoverCard key={spot.id} {...spot} />
              ))}
            </View>
          </View>
        }
      />

      <Modal
        transparent
        visible={!!selectedEvent}
        animationType="none"
        onRequestClose={() => setSelectedEvent(null)}>
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setSelectedEvent(null)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="self-center"
            style={{ maxWidth: '50%' }}>
            <Animated.View
              style={eventModalStyle}
              className="bg-card border border-border rounded-2xl p-4 items-center">
              <Text className="text-lg font-semibold text-foreground text-center">
                {selectedEvent?.title}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1 text-center" numberOfLines={1}>
                {selectedEvent?.venue}
              </Text>
              <Text className="text-sm text-muted-foreground mt-0.5 text-center" numberOfLines={1}>
                {selectedEvent?.time}
              </Text>
              <View className="mt-3 self-center bg-secondary rounded-full px-2 py-1">
                <Text className="text-xs text-secondary-foreground">{selectedEvent?.tag}</Text>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 5. Result Modal */}
      <Modal visible={!!luckySpot} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 min-h-[50%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">Your Lucky Spot!</Text>
              <Pressable onPress={() => setLuckySpot(null)} className="p-2 bg-secondary rounded-full">
                <Feather name="x" size={24} color="#fff" />
              </Pressable>
            </View>

            <Text className="text-muted-foreground mb-6">
              Our AI analyzed your history and thinks you will love this:
            </Text>

            {luckySpot && (
              <View className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
                {/* Image Placeholder or Actual Image */}
                <Image source={luckySpot.image} className="w-full h-48" resizeMode="cover" />

                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-xl font-bold text-foreground flex-1 mr-2">{luckySpot.name}</Text>
                    <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                      <Text className="text-green-700 dark:text-green-300 font-bold text-xs">{luckySpot.aiScore}</Text>
                    </View>
                  </View>

                  <Text className="text-muted-foreground mb-3">{luckySpot.location} • {luckySpot.distance}</Text>

                  <View className="bg-purple-100 dark:bg-purple-900/30 self-start px-3 py-1.5 rounded-lg mb-4 flex-row items-center">
                    <MaterialIcons name="auto-awesome" size={14} color="#a855f7" />
                    <Text className="text-purple-700 dark:text-purple-300 text-xs font-semibold ml-1">{luckySpot.matchReason}</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {luckySpot.tags && luckySpot.tags.map((t: string) => (
                      <Text key={t} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">#{t}</Text>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => setLuckySpot(null)}
              className="w-full bg-primary h-14 rounded-xl items-center justify-center"
            >
              <Text className="text-primary-foreground font-bold text-lg">Awesome!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
