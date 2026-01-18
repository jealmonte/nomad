import { Feather } from '@expo/vector-icons';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

export type TripCardProps = {
    id: number;
    destination: string;
    image?: ImageSourcePropType | string;
    dates: string;
    status: 'upcoming' | 'past';
    daysCount: number;
    spotsCount: number;
    onPress?: () => void;
};

export function TripCard({
    destination,
    image,
    dates,
    status,
    daysCount,
    spotsCount,
    onPress,
}: TripCardProps) {
    const imageSource = typeof image === 'string' ? { uri: image } : image;

    return (
        <Pressable
            onPress={onPress}
            className={`bg-card border border-border rounded-xl overflow-hidden ${status === 'past' ? 'opacity-80' : ''}`}>
            <View className="relative">
                {imageSource ? (
                    <Image source={imageSource} className="w-full h-32" resizeMode="cover" />
                ) : (
                    <View className="w-full h-32 bg-muted" />
                )}
                {status === 'upcoming' && (
                    <View className="absolute top-2 left-2 bg-primary rounded-full px-2 py-0.5">
                        <Text className="text-primary-foreground text-xs font-semibold">Upcoming</Text>
                    </View>
                )}
            </View>

            <View className="p-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="font-semibold text-foreground">{destination}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                            <Feather name="calendar" size={12} color="#a6a6a6" />
                            <Text className="text-sm text-muted-foreground">{dates}</Text>
                        </View>
                    </View>
                    <Feather name="chevron-right" size={18} color="#a6a6a6" />
                </View>

                <View className="flex-row gap-3 mt-3 pt-3 border-t border-border">
                    <Text className="text-sm text-muted-foreground">
                        <Text className="text-foreground font-medium">{daysCount}</Text> days
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        <Text className="text-foreground font-medium">{spotsCount}</Text> spots
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}
