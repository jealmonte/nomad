import { Feather } from '@expo/vector-icons';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RankedSpotCard, type RankedSpotCardProps } from '@/components/cards/ranked-spot-card';

const images = {
  avatar: require('@/assets/images/traveler-man-portrait.jpg'),
  fushimi: require('@/assets/images/fushimi-inari-torii.jpg'),
  cafe: require('@/assets/images/cafe-central-vienna.jpg'),
  sushi: require('@/assets/images/sushi-restaurant-tokyo.jpg'),
  plitvice: require('@/assets/images/plitvice-lakes-waterfall.jpg'),
  angkor: require('@/assets/images/angkor-wat-sunrise.jpg'),
};

const profileData = {
  name: 'Alex Thompson',
  handle: '@alextravel',
  avatar: images.avatar,
  bio: 'Exploring the world one spot at a time ✈️',
  stats: {
    countries: 24,
    cities: 67,
    spots: 342,
    avgScore: 8.4,
  },
  topTags: ['coffee', 'temples', 'food', 'nature'],
  social: {
    followers: 1247,
    following: 389,
  },
};

const rankedSpots: RankedSpotCardProps[] = [
  {
    rank: 1,
    name: 'Fushimi Inari Shrine',
    location: 'Kyoto, Japan',
    image: images.fushimi,
    aiScore: 9.8,
    tag: 'temples',
  },
  {
    rank: 2,
    name: 'Café Central',
    location: 'Vienna, Austria',
    image: images.cafe,
    aiScore: 9.6,
    tag: 'coffee',
  },
  {
    rank: 3,
    name: 'Sukiyabashi Jiro',
    location: 'Tokyo, Japan',
    image: images.sushi,
    aiScore: 9.5,
    tag: 'food',
  },
  {
    rank: 4,
    name: 'Plitvice Lakes',
    location: 'Croatia',
    image: images.plitvice,
    aiScore: 9.4,
    tag: 'nature',
  },
  {
    rank: 5,
    name: 'Angkor Wat',
    location: 'Siem Reap, Cambodia',
    image: images.angkor,
    aiScore: 9.3,
    tag: 'temples',
  },
];

type ListItem = { type: 'content'; id: 'content' };
const listData: ListItem[] = [{ type: 'content', id: 'content' }];

export function ProfileTab() {
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
              <Text className="text-2xl font-bold tracking-tight text-foreground">Profile</Text>
              <View className="flex-row gap-2">
                <Pressable className="h-10 w-10 rounded-full items-center justify-center bg-secondary">
                  <Feather name="share-2" size={18} color="#fff" />
                </Pressable>
                <Pressable className="h-10 w-10 rounded-full items-center justify-center bg-secondary">
                  <Feather name="settings" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        }
        renderItem={() => (
          <View className="py-4 gap-6">
            <View className="flex-row items-center gap-4">
              <Image
                source={profileData.avatar}
                className="h-20 w-20 rounded-full border-2 border-primary"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{profileData.name}</Text>
                <Text className="text-sm text-muted-foreground">{profileData.handle}</Text>
                <Text className="text-sm text-foreground mt-1">{profileData.bio}</Text>
              </View>
            </View>

            <View className="flex-row gap-6">
              <Pressable className="items-center">
                <Text className="text-lg font-bold text-foreground">
                  {profileData.social.followers.toLocaleString()}
                </Text>
                <Text className="text-xs text-muted-foreground">Followers</Text>
              </Pressable>
              <Pressable className="items-center">
                <Text className="text-lg font-bold text-foreground">
                  {profileData.social.following}
                </Text>
                <Text className="text-xs text-muted-foreground">Following</Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatCard icon="globe" label="Countries" value={profileData.stats.countries} />
              <StatCard icon="map-pin" label="Cities" value={profileData.stats.cities} />
              <StatCard icon="star" label="Spots Logged" value={profileData.stats.spots} />
              <StatCard icon="users" label="Avg Score" value={profileData.stats.avgScore} />
            </View>

            <View>
              <Text className="text-sm font-semibold text-muted-foreground mb-2">TASTE PROFILE</Text>
              <View className="flex-row flex-wrap gap-2">
                {profileData.topTags.map((tag) => (
                  <View key={tag} className="bg-secondary rounded-full px-3 py-1">
                    <Text className="text-secondary-foreground text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Your Top Spots</Text>
              <View className="gap-2">
                {rankedSpots.map((spot) => (
                  <RankedSpotCard key={spot.rank} {...spot} />
                ))}
              </View>
            </View>

            <View className="p-4 rounded-xl border border-primary/30 bg-primary/10">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-semibold text-foreground">Invite Friends</Text>
                  <Text className="text-sm text-muted-foreground">Share your invite code</Text>
                </View>
                <Pressable className="rounded-full bg-secondary px-3 py-2">
                  <Text className="text-secondary-foreground font-semibold">
                    WANDR-{profileData.handle.slice(1, 5).toUpperCase()}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 w-[48%]">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
          <Feather name={icon} size={18} color="#33d6b3" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
          <Text className="text-xs text-muted-foreground">{label}</Text>
        </View>
      </View>
    </View>
  );
}
