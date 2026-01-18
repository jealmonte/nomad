// components/tabs/discover-tab.tsx
import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Localization from 'expo-localization';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiscoverCard, type DiscoverCardProps } from '@/components/cards/discover-card';
import { LogSpotSheet } from '@/components/sheets/log-spot-sheet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { getLucky } from '@/services/woodwide';

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
    matchReason:
      'Pittsburgh’s signature skyline icon with stunning Gothic interiors and the Nationality Rooms',
  },
  {
    id: 4,
    name: 'Strip District',
    location: '120 Fifth Avenue',
    image: images.strip,
    aiScore: 8.9,
    distance: '3.0 mi',
    tags: ['food', 'markets'],
    matchReason:
      'Lively food markets and local shops; great for sampling Pittsburgh staples',
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
    matchReason:
      'World‑class bird sanctuary with immersive walkthroughs and live encounters',
  },
];

const tags = Array.from(new Set(recommendations.flatMap((spot) => spot.tags)));

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
    <Pressable
      onPress={onPress}
      className="flex-1 min-w-0 bg-card border border-border rounded-xl p-3"
    >
      <Text
        className="text-foreground font-semibold text-sm mb-1"
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
        {venue}
      </Text>
      <Text
        className="text-xs text-muted-foreground mt-0.5"
        numberOfLines={1}
      >
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
      ? new Intl.DisplayNames([locale?.languageTag ?? 'en'], {
          type: 'region',
        }).of(region)
      : region;

  return `Near ${name ?? region}`;
})();

export function DiscoverTab() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme: 'light' | 'dark' = colorScheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [isLuckyLoading, setIsLuckyLoading] = useState(false);
  const [luckySpot, setLuckySpot] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] =
    useState<(typeof liveEvents)[number] | null>(null);
  const [logSpotOpen, setLogSpotOpen] = useState(false);
  const [prefillSpot, setPrefillSpot] = useState<{
    name: string;
    location: string;
    tags: string[];
  } | null>(null);

  // User search state
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<
    { id: string; username: string; first_name: string | null; last_name: string | null }[]
  >([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchAttempted, setUserSearchAttempted] = useState(false);

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
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const openLogSpot = (spot: DiscoverCardProps) => {
    setPrefillSpot({
      name: spot.name,
      location: spot.location,
      tags: spot.tags,
    });
    setLogSpotOpen(true);
  };

  const handleGetLucky = async () => {
    setIsLuckyLoading(true);
    setLuckySpot(null);

    try {
      const spot = await getLucky();

      const rawScore = (spot.compatibilityScore || 0) * 100;
      const displayScore = rawScore > 99 ? 99 : rawScore.toFixed(0);

      const randomImageKey = Object.keys(images)[
        Math.floor(Math.random() * Object.keys(images).length)
      ] as keyof typeof images;

      setLuckySpot({
        ...spot,
        image: images[randomImageKey],
        matchReason: `AI Match: ${displayScore}%`,
        distance:
          typeof spot.distance === 'number'
            ? `${spot.distance} km`
            : spot.distance,
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('AI Error', 'Could not find a lucky spot. Please try again.');
    } finally {
      setIsLuckyLoading(false);
    }
  };

  const handleUserSearch = async () => {
    const q = userQuery.trim();
    setUserSearchAttempted(true);

    if (!q) {
      setUserResults([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      console.log('Searching users for (exact username):', q);

      // 1) Exact username match first
      let { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name')
        .eq('username', q)
        .limit(20);

      if (error) {
        console.error('DISCOVER user search exact error', error);
      }

      // 2) If nothing exact, try partial across username/first/last
      if (!data || data.length === 0) {
        console.log('No exact match, trying partial search');
        const { data: partialData, error: partialError } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name')
          .or(
            `username.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`,
          )
          .limit(20);
        if (partialError) {
          console.error('DISCOVER user partial search error', partialError);
        }
        data = partialData ?? [];
      }

      console.log('User search final rows:', data?.length ?? 0);
      setUserResults(data ?? []);
    } catch (err) {
      console.error('DISCOVER user search exception', err);
      setUserResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const recommendedIds = new Set([2, 3]);

  const filterSpot = (spot: DiscoverCardProps) => {
    const matchesQuery =
      !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => spot.tags.includes(tag));
    return matchesQuery && matchesTags;
  };

  const filteredRecommended = useMemo(
    () =>
      recommendations.filter(
        (spot) => recommendedIds.has(spot.id) && filterSpot(spot),
      ),
    [searchQuery, selectedTags],
  );
  const filteredPopular = useMemo(
    () =>
      recommendations.filter(
        (spot) => !recommendedIds.has(spot.id) && filterSpot(spot),
      ),
    [searchQuery, selectedTags],
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
            <Text className="text-2xl font-bold tracking-tight text-foreground mb-3">
              Discover
            </Text>

            {/* Search people by username */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-1">
                SEARCH PEOPLE
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1 flex-row items-center bg-muted rounded-xl h-11 px-3">
                  <Feather name="user" size={16} color="#a6a6a6" />
                  <TextInput
                    value={userQuery}
                    onChangeText={setUserQuery}
                    placeholder="Search by username or name..."
                    placeholderTextColor="#a6a6a6"
                    className="flex-1 ml-2 text-foreground"
                    onSubmitEditing={handleUserSearch}
                    returnKeyType="search"
                  />
                </View>
                <Pressable
                  onPress={handleUserSearch}
                  className="rounded-xl h-11 px-3 items-center justify-center bg-secondary"
                >
                  {userSearchLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-secondary-foreground text-xs font-semibold">
                      Search
                    </Text>
                  )}
                </Pressable>
              </View>

              {userResults.length > 0 && (
                <View className="mt-3 rounded-xl border border-border bg-card">
                  {userResults.map((user) => {
                    const name =
                      `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
                      user.username;
                    return (
                      <Pressable
                        key={user.id}
                        onPress={() =>
                          router.push({
                            pathname: '/users/[id]',
                            params: { id: user.id },
                          })
                        }
                        className="flex-row items-center px-3 py-2 border-b border-border last:border-b-0"
                      >
                        <View className="h-8 w-8 rounded-full bg-secondary items-center justify-center mr-3">
                          <Feather name="user" size={16} color="#fff" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {name}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            @{user.username}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {userSearchAttempted && !userSearchLoading && userResults.length === 0 && (
                <View className="mt-3 rounded-xl border border-border bg-card px-3 py-3">
                  <Text className="text-sm font-semibold text-foreground">
                    No users found
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    Try a different username or name.
                  </Text>
                </View>
              )}
            </View>

            {/* Existing spot search */}
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
                        className={`rounded-full px-3 py-1.5 ${
                          active ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        <Text
                          className={
                            active
                              ? 'text-primary-foreground text-xs'
                              : 'text-secondary-foreground text-xs'
                          }
                        >
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
                {/* Get Lucky button */}
                <Pressable
                  onPress={handleGetLucky}
                  disabled={isLuckyLoading}
                  className={`w-full rounded-xl h-14 items-center justify-center flex-row ${
                    isLuckyLoading ? 'bg-primary/80' : 'bg-primary'
                  }`}
                >
                  {isLuckyLoading ? (
                    <ActivityIndicator color="#0f1116" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="auto-awesome"
                        size={20}
                        color="#0f1116"
                      />
                      <Text className="ml-2 text-primary-foreground text-base font-semibold">
                        Get Lucky - Surprise Me!
                      </Text>
                    </>
                  )}
                </Pressable>

                <View className="flex-row items-center justify-between mt-4 mb-2">
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    Live Events
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Feather name="map-pin" size={16} color="#33d6b3" />
                    <Text className="text-sm text-muted-foreground">
                      {locationLabel}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  {liveEvents.map((ev) => (
                    <LiveEventCard
                      key={ev.id}
                      {...ev}
                      onPress={() => setSelectedEvent(ev)}
                    />
                  ))}
                </View>

                <Text className="text-lg font-semibold text-foreground mb-3 mt-3">
                  Recommended for You
                </Text>
              </View>
            );
          }
          return <DiscoverCard {...item} onPress={() => openLogSpot(item)} />;
        }}
        ListFooterComponent={
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Popular in Pittsburgh
            </Text>
            <View>
              {filteredPopular.map((spot) => (
                <DiscoverCard
                  key={spot.id}
                  {...spot}
                  onPress={() => openLogSpot(spot)}
                />
              ))}
            </View>
          </View>
        }
      />

      <LogSpotSheet
        open={logSpotOpen}
        onOpenChange={(open) => {
          setLogSpotOpen(open);
          if (!open) setPrefillSpot(null);
        }}
        initialSpot={prefillSpot ?? undefined}
      />

      {/* Live event modal */}
      <Modal
        transparent
        visible={!!selectedEvent}
        animationType="none"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setSelectedEvent(null)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="self-center"
            style={{ maxWidth: '50%' }}
          >
            <Animated.View
              style={eventModalStyle}
              className="bg-card border border-border rounded-2xl p-4 items-center"
            >
              <Text className="text-lg font-semibold text-foreground text-center">
                {selectedEvent?.title}
              </Text>
              <Text
                className="text-sm text-muted-foreground mt-1 text-center"
                numberOfLines={1}
              >
                {selectedEvent?.venue}
              </Text>
              <Text
                className="text-sm text-muted-foreground mt-0.5 text-center"
                numberOfLines={1}
              >
                {selectedEvent?.time}
              </Text>
              <View className="mt-3 self-center bg-secondary rounded-full px-2 py-1">
                <Text className="text-xs text-secondary-foreground">
                  {selectedEvent?.tag}
                </Text>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Lucky spot modal */}
      <Modal visible={!!luckySpot} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 min-h-[50%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">
                Your Lucky Spot!
              </Text>
              <Pressable
                onPress={() => setLuckySpot(null)}
                className="p-2 bg-secondary rounded-full"
              >
                <Feather name="x" size={24} color="#fff" />
              </Pressable>
            </View>

            <Text className="text-muted-foreground mb-6">
              Our AI analyzed your history and thinks you will love this:
            </Text>

            {luckySpot && (
              <View className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
                <Image
                  source={luckySpot.image}
                  className="w-full h-48"
                  resizeMode="cover"
                />

                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-xl font-bold text-foreground flex-1 mr-2">
                      {luckySpot.name}
                    </Text>
                    <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                      <Text className="text-green-700 dark:text-green-300 font-bold text-xs">
                        {luckySpot.aiScore}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-muted-foreground mb-3">
                    {luckySpot.location} • {luckySpot.distance}
                  </Text>

                  <View className="bg-purple-100 dark:bg-purple-900/30 self-start px-3 py-1.5 rounded-lg mb-4 flex-row items-center">
                    <MaterialIcons
                      name="auto-awesome"
                      size={14}
                      color="#a855f7"
                    />
                    <Text className="text-purple-700 dark:text-purple-300 text-xs font-semibold ml-1">
                      {luckySpot.matchReason}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {luckySpot.tags &&
                      luckySpot.tags.map((t: string) => (
                        <Text
                          key={t}
                          className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded"
                        >
                          #{t}
                        </Text>
                      ))}
                  </View>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => setLuckySpot(null)}
              className="w-full bg-primary h-14 rounded-xl items-center justify-center"
            >
              <Text className="text-primary-foreground font-bold text-lg">
                Awesome!
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
