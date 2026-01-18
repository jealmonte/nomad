import { Feather, Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/cards/spot-card';
import { LogSpotSheet } from '@/components/sheets/log-spot-sheet';

const images = {
    sarah: require('@/assets/images/diverse-woman-avatar.png'),
    marco: require('@/assets/images/man-avatar-beard.png'),
    emma: require('@/assets/images/woman-blonde-avatar.jpg'),
    senso: require('@/assets/images/senso-ji-temple-tokyo.jpg'),
    cafe: require('@/assets/images/cafe-de-flore-paris.jpg'),
    fushimi: require('@/assets/images/fushimi-inari-shrine-gates.jpg'),
};

const feedData = [
    {
        id: 1,
        user: { name: "Sarah Chen", avatar: images.sarah, handle: "@sarahc" },
        spot: {
            name: "Senso-ji Temple",
            location: "Tokyo, Japan",
            image: images.senso,
            aiScore: 9.2,
            tags: ["temples", "culture", "must-see"],
        },
        review:
            "Absolutely magical at sunrise. The crowds are minimal and the light is perfect for photos. Don't skip the nearby street food!",
        photos: 3,
        timestamp: "2h ago",
    },
    {
        id: 2,
        user: { name: "Marco Rivera", avatar: images.marco, handle: "@marco_travels" },
        spot: {
            name: "Café de Flore",
            location: "Paris, France",
            image: images.cafe,
            aiScore: 8.7,
            tags: ["coffee", "iconic", "breakfast"],
        },
        review: "Classic Parisian vibes. The hot chocolate is legendary but pricey. Perfect for people watching.",
        photos: 2,
        timestamp: "5h ago",
    },
    {
        id: 3,
        user: { name: "Emma Wilson", avatar: images.emma, handle: "@emma.w" },
        spot: {
            name: "Fushimi Inari Shrine",
            location: "Kyoto, Japan",
            image: images.fushimi,
            aiScore: 9.5,
            tags: ["temples", "hiking", "photography"],
        },
        review:
            "The hike through thousands of torii gates is surreal. Go early morning to beat the crowds - totally worth the early wake up!",
        photos: 5,
        timestamp: "1d ago",
    },
]

type ActionRow = { type: 'actions'; id: 'actions' };
type FeedItem = (typeof feedData)[number];
const listData: Array<ActionRow | FeedItem> = [{ type: 'actions', id: 'actions' }, ...feedData];

export function HomeTab() {
    const [showLogSpot, setShowLogSpot] = useState(false);

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
                                <Text className="text-2xl font-bold text-foreground">Nomad</Text>
                                <Text className="text-sm text-muted-foreground">Your travel feed</Text>
                            </View>
                            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                <MaterialIcons name="auto-awesome" size={20} color="#33d6b3" />
                            </Pressable>
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    if ('type' in item) {
                        return (
                            <View className="py-4 flex-row gap-3">
                                <Pressable
                                    onPress={() => setShowLogSpot(true)}
                                    className="flex-1 h-12 rounded-xl bg-primary items-center justify-center flex-row">
                                    <Feather name="plus" size={18} color="#0f1116" />
                                    <Text className="ml-2 text-primary-foreground font-semibold">Log a Spot</Text>
                                </Pressable>
                                <Pressable className="flex-1 h-12 rounded-xl bg-secondary items-center justify-center flex-row">
                                    <MaterialIcons name="auto-awesome" size={20} color="#33d6b3" />
                                    <Text className="ml-2 text-secondary-foreground font-semibold">Get Lucky</Text>
                                </Pressable>

                                <Pressable className="h-12 w-12 rounded-xl bg-secondary items-center justify-center">
                                    <Ionicons name="airplane" size={18} color="#fff" />
                                </Pressable>
                            </View>

                        );
                    }
                    return <SpotCard {...item} />;
                }}
            />

            <LogSpotSheet open={showLogSpot} onOpenChange={setShowLogSpot} />
        </SafeAreaView>
    );
}
