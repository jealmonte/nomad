import { Feather, Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/cards/spot-card';
import { LogSpotSheet } from '@/components/sheets/log-spot-sheet';
import { NewTripSheet } from '@/components/sheets/new-trip-sheet';
import { getImagePublicUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { getLucky } from '@/services/woodwide';

// --- Local images for fallback feed + Get Lucky ---
const images = {
  sarah: require('@/assets/images/diverse-woman-avatar.png'),
  marco: require('@/assets/images/man-avatar-beard.png'),
  emma: require('@/assets/images/woman-blonde-avatar.jpg'),
  senso: require('@/assets/images/senso-ji-temple-tokyo.jpg'),
  cafe: require('@/assets/images/cafe-de-flore-paris.jpg'),
  fushimi: require('@/assets/images/fushimi-inari-shrine-gates.jpg'),
};

const locationImages = [images.senso, images.cafe, images.fushimi];

const fallbackFeed = [
  {
    id: 'local-1',
    user: { name: 'Sarah Chen', avatar: images.sarah, handle: '@sarahc' },
    spot: {
      name: 'Senso-ji Temple',
      location: 'Tokyo, Japan',
      image: images.senso,
      aiScore: 9.2,
      tags: ['temples', 'culture', 'must-see'],
    },
    review:
      "Absolutely magical at sunrise. The crowds are minimal and the light is perfect for photos. Don't skip the nearby street food!",
    photos: 3,
    timestamp: '2h ago',
  },
  {
    id: 'local-2',
    user: {
      name: 'Marco Rivera',
      avatar: images.marco,
      handle: '@marco_travels',
    },
    spot: {
      name: 'Café de Flore',
      location: 'Paris, France',
      image: images.cafe,
      aiScore: 8.7,
      tags: ['coffee', 'iconic', 'breakfast'],
    },
    review:
      'Classic Parisian vibes. The hot chocolate is legendary but pricey. Perfect for people watching.',
    photos: 2,
    timestamp: '5h ago',
  },
  {
    id: 'local-3',
    user: { name: 'Emma Wilson', avatar: images.emma, handle: '@emma.w' },
    spot: {
      name: 'Fushimi Inari Shrine',
      location: 'Kyoto, Japan',
      image: images.fushimi,
      aiScore: 9.5,
      tags: ['temples', 'hiking', 'photography'],
    },
    review:
      'The hike through thousands of torii gates is surreal. Go early morning to beat the crowds - totally worth the early wake up!',
    photos: 5,
    timestamp: '1d ago',
  },
];

// --- Types ---
type FeedPost = {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: any; // local require or { uri }
  };
  spot: {
    name: string;
    location: string;
    image: any; // local require or { uri }
    aiScore: number;
    tags: string[];
  };
  review: string;
  photos: number;
  timestamp: string;
};

type ActionRow = { type: 'actions'; id: 'actions' };
type ListItem = ActionRow | FeedPost;

export function HomeTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogSpot, setShowLogSpot] = useState(false);
  const [showNewTripSheet, setShowNewTripSheet] = useState(false);

  const [isLuckyLoading, setIsLuckyLoading] = useState(false);
  const [luckySpot, setLuckySpot] = useState<any>(null);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      console.log('FEED: fetching from Supabase...');

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          auto_score,
          reflection,
          photos_count,
          created_at,
          user:user_id (
            name,
            handle,
            avatar_url
          ),
          spot:spot_id (
            name,
            city,
            country,
            category,
            image_url
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.log('FEED: error fetching from Supabase, using fallback', error);
        setPosts(fallbackFeed);
        setLoading(false);
        return;
      }

      const mapped: FeedPost[] = data.map((row: any) => {
        const avatarPath: string | null = row.user?.avatar_url ?? null;
        const spotImagePath: string | null = row.spot?.image_url ?? null;
      
        const avatarUrl = getImagePublicUrl(avatarPath);
        const spotUrl = getImagePublicUrl(spotImagePath);
      
        return {
          id: row.id,
          user: {
            name: row.user?.name ?? 'Traveler',
            handle: row.user?.handle ?? '@nomad',
            avatar: avatarUrl ? { uri: avatarUrl } : null,
          },
          spot: {
            name: row.spot?.name ?? 'Unknown spot',
            location: row.spot
              ? `${row.spot.city ?? ''}${
                  row.spot.country ? `, ${row.spot.country}` : ''
                }`
              : '',
            image: spotUrl ? { uri: spotUrl } : null,
            aiScore: row.auto_score ?? 0,
            tags: row.spot?.category ? [row.spot.category] : [],
          },
          review: row.reflection ?? '',
          photos: row.photos_count ?? 0,
          timestamp: row.created_at
            ? new Date(row.created_at).toLocaleString()
            : '',
        };
      });

      if (mapped.length > 0) {
        console.log('FEED SOURCE: Supabase', mapped.length, 'posts');
        setPosts(mapped);
      } else {
        console.log('FEED SOURCE: fallback (Supabase returned 0 rows)');
        setPosts(fallbackFeed);
      }

      setLoading(false);
    };

    fetchFeed();
  }, []);

  const listData: ListItem[] = useMemo(
    () => [{ type: 'actions', id: 'actions' }, ...posts],
    [posts],
  );

  const handleGetLucky = async () => {
    setIsLuckyLoading(true);
    setLuckySpot(null);

    try {
      const spot = await getLucky();
      const rawScore = (spot.compatibilityScore || 0) * 100;
      const displayScore = rawScore > 99 ? 99 : Number(rawScore).toFixed(0);
      const randomImg =
        locationImages[Math.floor(Math.random() * locationImages.length)];

      setLuckySpot({
        ...spot,
        image: randomImg,
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={listData}
        keyExtractor={(item) => ('type' in item ? item.id : String(item.id))}
        stickyHeaderIndices={[0]}
        contentContainerClassName="px-4 pb-6"
        ListHeaderComponent={
          <View className="bg-background py-3 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  Nomad
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Your travel feed
                </Text>
              </View>
              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <MaterialIcons
                  name="auto-awesome"
                  size={20}
                  color="#33d6b3"
                />
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if ('type' in item) {
            return (
              <View className="py-4 flex-row gap-3">
                {/* Log Spot */}
                <Pressable
                  onPress={() => setShowLogSpot(true)}
                  className="flex-1 h-12 rounded-xl bg-primary items-center justify-center flex-row"
                >
                  <Feather name="plus" size={18} color="#0f1116" />
                  <Text className="ml-2 text-primary-foreground font-semibold">
                    Log a Spot
                  </Text>
                </Pressable>

                {/* Get Lucky */}
                <Pressable
                  onPress={handleGetLucky}
                  disabled={isLuckyLoading}
                  className={`flex-1 h-12 rounded-xl bg-secondary items-center justify-center flex-row ${
                    isLuckyLoading ? 'opacity-80' : ''
                  }`}
                >
                  {isLuckyLoading ? (
                    <ActivityIndicator size="small" color="#33d6b3" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="auto-awesome"
                        size={20}
                        color="#33d6b3"
                      />
                      <Text className="ml-2 text-secondary-foreground font-semibold">
                        Get Lucky
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* Plan Trip */}
                <Pressable
                  onPress={() => setShowNewTripSheet(true)}
                  className="h-12 w-12 rounded-xl bg-secondary items-center justify-center"
                >
                  <Ionicons name="airplane" size={18} color="#fff" />
                </Pressable>
              </View>
            );
          }

          return <SpotCard {...item} />;
        }}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : null
        }
      />

      <LogSpotSheet open={showLogSpot} onOpenChange={setShowLogSpot} />
      <NewTripSheet open={showNewTripSheet} onOpenChange={setShowNewTripSheet} />

      {/* Lucky Result Modal */}
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
              Based on your feed activity, we think you'll love this:
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
