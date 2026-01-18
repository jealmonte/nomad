import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiscoverCard, type DiscoverCardProps } from '@/components/cards/discover-card';

const tags = ['temples', 'nightlife', 'coffee', 'beaches', 'nature', 'food', 'museums', 'markets'];

const images = {
  tsukiji: require('@/assets/images/tsukiji-fish-market-tokyo.jpg'),
  golden: require('@/assets/images/golden-gai-tokyo-nightlife.jpg'),
  teamlab: require('@/assets/images/teamlab-borderless-digital-art.jpg'),
  meiji: require('@/assets/images/meiji-shrine-tokyo-forest.jpg'),
};

const recommendations: DiscoverCardProps[] = [
  {
    id: 1,
    name: 'Tsukiji Outer Market',
    location: 'Tokyo, Japan',
    image: images.tsukiji,
    aiScore: 9.1,
    distance: '2.3 km',
    tags: ['food', 'markets', 'breakfast'],
    matchReason: 'Based on your love for food markets',
  },
  {
    id: 2,
    name: 'Golden Gai',
    location: 'Shinjuku, Tokyo',
    image: images.golden,
    aiScore: 8.9,
    distance: '4.1 km',
    tags: ['nightlife', 'bars', 'authentic'],
    matchReason: 'Friends rated this highly',
  },
  {
    id: 3,
    name: 'teamLab Borderless',
    location: 'Tokyo, Japan',
    image: images.teamlab,
    aiScore: 9.4,
    distance: '8.2 km',
    tags: ['museums', 'art', 'immersive'],
    matchReason: 'Trending with travelers like you',
  },
  {
    id: 4,
    name: 'Meiji Shrine',
    location: 'Shibuya, Tokyo',
    image: images.meiji,
    aiScore: 8.8,
    distance: '5.6 km',
    tags: ['temples', 'nature', 'peaceful'],
    matchReason: 'You liked similar temples',
  },
];

export function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filtered = useMemo(() => {
    if (!searchQuery && selectedTags.length === 0) return recommendations;
    return recommendations.filter((spot) => {
      const matchesQuery =
        !searchQuery ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((tag) => spot.tags.includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [searchQuery, selectedTags]);

  type ListItem = { type: 'intro'; id: 'intro' } | DiscoverCardProps;
  const listData: ListItem[] = [{ type: 'intro', id: 'intro' }, ...filtered];

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
                <Pressable className="w-full bg-primary rounded-xl h-14 items-center justify-center flex-row">
                  <MaterialIcons name="auto-awesome" size={20} color="#0f1116" />
                  <Text className="ml-2 text-primary-foreground text-base font-semibold">
                    Get Lucky - Surprise Me!
                  </Text>
                </Pressable>

                <View className="py-3 flex-row items-center gap-2">
                  <Feather name="map-pin" size={16} color="#33d6b3" />
                  <Text className="text-sm text-muted-foreground">Near Tokyo, Japan</Text>
                </View>

                <Text className="text-lg font-semibold text-foreground mb-3">Recommended for You</Text>
              </View>
            );
          }
          return <DiscoverCard {...item} />;
        }}
      />
    </SafeAreaView>
  );
}
