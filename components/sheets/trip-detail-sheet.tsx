import { Feather, MaterialIcons } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Trip = {
    id: number;
    destination: string;
    image?: ImageSourcePropType | string;
    dates: string;
    status: 'upcoming' | 'past';
    daysCount: number;
    spotsCount: number;
};

type TripDetailSheetProps = {
    trip: Trip | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const itinerary = [
    {
        day: 1,
        date: 'Mar 15',
        activities: [
            { time: 'Morning', spot: 'Senso-ji Temple', type: 'temples' },
            { time: 'Afternoon', spot: 'Nakamise Shopping Street', type: 'shopping' },
            { time: 'Evening', spot: 'Shibuya Crossing', type: 'sightseeing' },
        ],
    },
    {
        day: 2,
        date: 'Mar 16',
        activities: [
            { time: 'Morning', spot: 'Tsukiji Outer Market', type: 'food' },
            { time: 'Afternoon', spot: 'teamLab Borderless', type: 'museums' },
            { time: 'Evening', spot: 'Golden Gai', type: 'nightlife' },
        ],
    },
    {
        day: 3,
        date: 'Mar 17',
        activities: [
            { time: 'Morning', spot: 'Meiji Shrine', type: 'temples' },
            { time: 'Afternoon', spot: 'Harajuku', type: 'shopping' },
            { time: 'Evening', spot: 'Robot Restaurant', type: 'nightlife' },
        ],
    },
];

export function TripDetailSheet({ trip, open, onOpenChange }: TripDetailSheetProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['90%'], []);
    const theme = useColorScheme() ?? 'light';

    useEffect(() => {
        if (open && trip) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [open, trip]);

    if (!trip) return null;

    const imageSource = typeof trip.image === 'string' ? { uri: trip.image } : trip.image;

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={() => onOpenChange(false)}
            backgroundStyle={{ backgroundColor: Colors[theme].background }}
            handleIndicatorStyle={{ backgroundColor: Colors[theme].icon }}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
            )}>
            <View className="flex-1">
                <View className="relative h-48">
                    {imageSource ? (
                        <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-muted" />
                    )}
                    <View className="absolute inset-0 bg-background/60" />
                    <Pressable
                        onPress={() => onOpenChange(false)}
                        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background/60 items-center justify-center">
                        <Feather name="x" size={18} color={Colors[theme].text} />
                    </Pressable>
                    <View className="absolute bottom-4 left-4">
                        <Text className="text-2xl font-bold text-foreground">{trip.destination}</Text>
                        <Text className="text-sm text-muted-foreground">{trip.dates}</Text>
                    </View>
                </View>

                <BottomSheetScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16, paddingBottom: 64 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-row items-center gap-2">
                            <Feather name="map-pin" size={16} color={Colors[theme].tint} />
                            <Text className="text-sm text-foreground">{trip.spotsCount} spots</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Feather name="clock" size={16} color={Colors[theme].tint} />
                            <Text className="text-sm text-foreground">{trip.daysCount} days</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2 mb-4">
                        <MaterialIcons name="auto-awesome" size={16} color={Colors[theme].tint} />
                        <Text className="text-sm text-primary font-medium">AI-Generated Itinerary</Text>
                    </View>

                    <View className="gap-6">
                        {itinerary.map((day) => (
                            <View key={day.day}>
                                <View className="flex-row items-center gap-2 mb-3">
                                    <View className="h-8 w-8 rounded-full bg-primary items-center justify-center">
                                        <Text className="text-primary-foreground text-sm font-bold">{day.day}</Text>
                                    </View>
                                    <Text className="font-semibold text-foreground">Day {day.day}</Text>
                                    <Text className="text-sm text-muted-foreground">{day.date}</Text>
                                </View>

                                <View className="gap-2 pl-10">
                                    {day.activities.map((activity, idx) => (
                                        <View key={idx} className="p-3 bg-card rounded-xl border border-border flex-row items-center">
                                            <View className="flex-1">
                                                <Text className="text-xs text-muted-foreground">{activity.time}</Text>
                                                <Text className="text-sm font-medium text-foreground">{activity.spot}</Text>
                                            </View>
                                            <View className="bg-secondary rounded-full px-2 py-0.5">
                                                <Text className="text-xs text-secondary-foreground">{activity.type}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    <Pressable className="mt-6 h-12 rounded-xl bg-secondary items-center justify-center">
                        <Text className="text-secondary-foreground font-semibold">Edit Itinerary</Text>
                    </Pressable>
                </BottomSheetScrollView>
            </View>
        </BottomSheetModal>
    );
}
