import { Feather } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';

type LogSpotSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const tags = ['temples', 'coffee', 'food', 'nightlife', 'nature', 'museums', 'beaches', 'markets'];

export function LogSpotSheet({ open, onOpenChange }: LogSpotSheetProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['90%'], []);
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

    const theme = useColorScheme() ?? 'light';

    const pickPhotos = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 6,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((asset) => asset.uri);
            setPhotos((prev) => [...prev, ...uris]);
        }
    };

    const removePhoto = (uri: string) => {
        setPhotos((prev) => prev.filter((p) => p !== uri));
    };
    useEffect(() => {
        if (open) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [open]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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
                    <Text className="text-xl font-semibold text-foreground">Log a Spot</Text>
                    <Pressable
                        onPress={() => onOpenChange(false)}
                        className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                        <Feather name="x" size={18} color={Colors[theme].text} />
                    </Pressable>
                </View>

                <Pressable
                    onPress={pickPhotos}
                    className="h-44 rounded-xl border-2 border-dashed border-border items-center justify-center bg-muted">
                    <Feather name="camera" size={28} color={Colors[theme].icon} />
                    <Text className="text-sm text-muted-foreground mt-2">Add photos</Text>
                </Pressable>

                {photos.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                        {photos.map((uri) => (
                            <View key={uri} className="relative">
                                <Image source={{ uri }} className="h-20 w-20 rounded-lg" />
                                <Pressable
                                    onPress={() => removePhoto(uri)}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background items-center justify-center">
                                    <Feather name="x" size={12} color={Colors[theme].text} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                <View className="mt-6">
                    <Text className="text-sm font-medium text-foreground mb-2">Spot Name</Text>
                    <BottomSheetTextInput
                        placeholder="Enter the name of the place"
                        placeholderTextColor={Colors[theme].icon}
                        className="bg-muted rounded-xl px-4 py-3 text-foreground"
                    />
                </View>

                <View className="mt-4">
                    <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
                    <View>
                        <Feather
                            name="map-pin"
                            size={16}
                            color={Colors[theme].icon}
                            style={{ position: 'absolute', left: 12, top: 14 }}
                        />
                        <BottomSheetTextInput
                            placeholder="City, Country"
                            placeholderTextColor={Colors[theme].icon}
                            className="bg-muted rounded-xl px-4 py-3 text-foreground"
                        />
                    </View>
                </View>

                <View className="mt-4">
                    <Text className="text-sm font-medium text-foreground mb-2">Tags</Text>
                    <View className="flex-row flex-wrap gap-2">
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
                </View>

                <View className="mt-4">
                    <Text className="text-sm font-medium text-foreground mb-2">Your Review</Text>
                    <BottomSheetTextInput
                        placeholder="Share your experience..."
                        placeholderTextColor={Colors[theme].icon}
                        multiline
                        textAlignVertical="top"
                        className="bg-muted rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                    />
                </View>

                <Pressable className="mt-6 h-12 rounded-xl bg-primary items-center justify-center">
                    <Text className="text-primary-foreground font-semibold">Log This Spot</Text>
                </Pressable>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
