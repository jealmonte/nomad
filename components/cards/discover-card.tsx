import { Feather } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

export type DiscoverCardProps = {
    id: number;
    name: string;
    location: string;
    image?: ImageSourcePropType | string;
    aiScore: number;
    distance: string;
    tags: string[];
    matchReason: string;
    onPress?: () => void;
};

export function DiscoverCard({
    name,
    location,
    image,
    aiScore,
    distance,
    tags,
    matchReason,
    onPress,
}: DiscoverCardProps) {
    const imageSource = typeof image === 'string' ? { uri: image } : image;

    return (
        <Pressable onPress={onPress} className="bg-card border border-border rounded-xl overflow-hidden mb-4">
            <View className="flex-row gap-3 p-3">
                <View className="relative w-24 h-24 self-center">
                    {imageSource ? (
                        <Image source={imageSource} className="w-full h-full rounded-lg" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full rounded-lg bg-muted" />
                    )}
                    <View className="absolute -top-1 -right-1 bg-primary rounded-full px-1.5 py-0.5">
                        <Text className="text-primary-foreground text-xs font-semibold">{aiScore}</Text>
                    </View>
                </View>

                <View className="flex-1 min-w-0">
                    <View className="flex-row items-start justify-between mb-1">
                        <Text
                            className="flex-1 pr-2 font-semibold text-foreground"
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {name}
                        </Text>
                        <View className="flex-shrink-0">
                            <MaterialCommunityIcons name="bookmark-outline" size={18} color="#a6a6a6" />
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2 mb-2">
                        <Feather name="map-pin" size={12} color="#a6a6a6" />
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            {location} • {distance}
                        </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-1 mb-2">
                        {tags.slice(0, 3).map((tag) => (
                            <View key={tag} className="bg-secondary rounded-full px-2 py-0.5">
                                <Text className="text-xs text-secondary-foreground">{tag}</Text>
                            </View>
                        ))}
                    </View>

                    <Text className="text-xs text-primary" numberOfLines={2} ellipsizeMode="tail">
                        {matchReason}
                    </Text>

                </View>
            </View>
        </Pressable>
    );
}
