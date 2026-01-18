import { Feather, MaterialIcons } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type NewTripSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const interests = ['temples', 'food', 'nightlife', 'nature', 'museums', 'beaches', 'shopping', 'art'];

export function NewTripSheet({ open, onOpenChange }: NewTripSheetProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const theme = useColorScheme() ?? 'light';

    useEffect(() => {
        if (open) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [open]);

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
        );
    };

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
            <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-semibold text-foreground">Plan a New Trip</Text>
                    <Pressable
                        onPress={() => onOpenChange(false)}
                        className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                        <Feather name="x" size={18} color={Colors[theme].text} />
                    </Pressable>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground mb-2">Where to?</Text>
                    <View>
                        <Feather
                            name="map-pin"
                            size={16}
                            color={Colors[theme].icon}
                            style={{ position: 'absolute', left: 12, top: 14 }}
                        />
                        <BottomSheetTextInput
                            placeholder="Enter destination"
                            placeholderTextColor={Colors[theme].icon}
                            className="bg-muted rounded-xl pl-9 pr-4 py-3 text-foreground"
                        />
                    </View>
                </View>

                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">Start Date</Text>
                        <View>
                            <Feather
                                name="calendar"
                                size={16}
                                color={Colors[theme].icon}
                                style={{ position: 'absolute', left: 12, top: 14 }}
                            />
                            <BottomSheetTextInput
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors[theme].icon}
                                className="bg-muted rounded-xl pl-9 pr-4 py-3 text-foreground"
                            />
                        </View>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground mb-2">End Date</Text>
                        <View>
                            <Feather
                                name="calendar"
                                size={16}
                                color={Colors[theme].icon}
                                style={{ position: 'absolute', left: 12, top: 14 }}
                            />
                            <BottomSheetTextInput
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors[theme].icon}
                                className="bg-muted rounded-xl pl-9 pr-4 py-3 text-foreground"
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground mb-2">What are you interested in?</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {interests.map((interest) => {
                            const active = selectedInterests.includes(interest);
                            return (
                                <Pressable
                                    key={interest}
                                    onPress={() => toggleInterest(interest)}
                                    className={`rounded-full px-3 py-1.5 ${active ? 'bg-primary' : 'bg-secondary'}`}>
                                    <Text className={active ? 'text-primary-foreground text-xs' : 'text-secondary-foreground text-xs'}>
                                        {interest}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View className="bg-primary/10 rounded-xl p-4 flex-row items-start gap-3">
                    <MaterialIcons name="auto-awesome" size={18} color={Colors[theme].tint} />
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">AI-Powered Itinerary</Text>
                        <Text className="text-xs text-muted-foreground mt-1">
                            We’ll create a day-by-day itinerary based on your interests.
                        </Text>
                    </View>
                </View>

                <Pressable className="mt-6 h-12 rounded-xl bg-primary items-center justify-center flex-row">
                    <MaterialIcons name="auto-awesome" size={18} color="#0f1116" />
                    <Text className="ml-2 text-primary-foreground font-semibold">Generate Itinerary</Text>
                </Pressable>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
