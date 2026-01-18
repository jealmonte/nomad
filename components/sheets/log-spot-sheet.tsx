// components/sheets/log-spot-sheet.tsx
import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUserId } from '@/lib/auth';
import { saveSpot } from '@/lib/db/spots';
import type { Spot } from '@/lib/types/spot';

// --- API CONFIGURATION (still available if you wire AI later) ---
const TOKEN_COMPANY_KEY = process.env.EXPO_PUBLIC_TOKEN_API_KEY;
const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PPLX_API_KEY;
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const COMPRESS_ENDPOINT = 'https://api.thetokencompany.com/v1/compress';
const PERPLEXITY_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

type LogSpotSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSpot?: {
    name?: string;
    location?: string;
    tags?: string[];
  };
};

const tags = [
  'Temples',
  'Coffee',
  'Food',
  'Nightlife',
  'Nature',
  'Museums',
  'Beaches',
  'Markets',
  'Outdoors',
  'Photo',
  'Nature',
  'Gardens',
  'Architecture',
  'History',
  'Family',
  'Wildlife',
  'Music',
];

const FooterSpacer = () => <View style={{ height: 400 }} />;

export function LogSpotSheet({ open, onOpenChange, initialSpot }: LogSpotSheetProps) {
  const listRef = useRef<any>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);

  const snapPoints = useMemo(() => ['90%'], []);
  const theme = useColorScheme() ?? 'light';

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Log This Spot');

  // Use theme colors instead of hard-coded light backgrounds
  const inputBg = '#181b1f';
  const inputBorder = '#26292e';
  const tagInactiveBg = '#181b1f';
  const tagInactiveText = Colors[theme].text;
  const tagActiveBg = Colors[theme].tint;
  const tagActiveText = '#ffffff';


  const [spotName, setSpotName] = useState('');
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [generatedRating, setGeneratedRating] = useState<number | null>(null);

  useEffect(() => {
    if (open) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [open]);

  useEffect(() => {
    if (!open || !initialSpot) return;

    setSpotName(initialSpot.name ?? '');
    setReview('');
    setSelectedTags(
      initialSpot.tags ? initialSpot.tags.filter((tag) => tags.includes(tag)) : []
    );
    setPhotos([]);
    setLocationName(initialSpot.location ?? '');
    setCoordinates(null);
    setGeneratedRating(null);
    setStatusText('Log This Spot');

    if (initialSpot.location) {
      placesRef.current?.setAddressText(initialSpot.location);
    }
  }, [open, initialSpot]);

  const resetForm = () => {
    setSpotName('');
    setReview('');
    setSelectedTags([]);
    setPhotos([]);
    setLocationName('');
    setCoordinates(null);
    setGeneratedRating(null);
    setStatusText('Log This Spot');
    placesRef.current?.setAddressText('');
  };

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getFinalRating = () => {
    if (generatedRating != null) return generatedRating;
    const r = 7.5 + Math.random() * 2.3;
    return Number(r.toFixed(1));
  };

  const handleSubmit = async () => {
    if (!spotName.trim()) {
      Alert.alert('Missing name', 'Please enter a spot name before logging.');
      return;
    }
  
    setIsLoading(true);
    setStatusText('Saving...');
  
    try {
      // 1) Get the real auth user id (UUID)
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Not signed in', 'You must be logged in to log a spot.');
        setStatusText('Log This Spot');
        setIsLoading(false);
        return;
      }
  
      // 2) Parse "City, Country" into city/country with NYC defaults
      let city = 'New York';
      let country = 'USA';
  
      if (locationName) {
        const parts = locationName.split(',').map((s) => s.trim());
        if (parts.length === 1) {
          city = parts[0] || city;
        } else if (parts.length >= 2) {
          city = parts[0] || city;
          country = parts[parts.length - 1] || country;
        }
      }
  
      const nowIso = new Date().toISOString();
      const autoScore = getFinalRating();
  
      const spot: Spot = {
        id: '',
        userId, // <-- real UUID here
        metadata: {
          name: spotName.trim(),
          category: selectedTags[0] ?? 'food',
          location: {
            city,
            country,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
          },
          priceRange: 2,
          visitDate: nowIso,
          imageUrl: photos[0] ?? undefined,
        },
        reflection: review.trim(),
        autoScore,
        reasoning: undefined,
        createdAt: nowIso,
        photosCount: photos.length,
      };
  
      await saveSpot(spot);
  
      setStatusText('Saved!');
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving spot', err);
      Alert.alert('Error', 'Could not save this spot. Please try again.');
      setStatusText('Log This Spot');
    } finally {
      setIsLoading(false);
    }
  };
  

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );

  const renderTagItem = ({ item }: { item: string }) => {
    const active = selectedTags.includes(item);
    return (
      <Pressable
        onPress={() => toggleTag(item)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: active ? Colors[theme].tint : inputBg,
          marginRight: 8,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: active ? '#fff' : Colors[theme].text,
            fontSize: 13,
          }}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onDismiss={() => onOpenChange(false)}
      handleStyle={{ backgroundColor: Colors[theme].background }}
      handleIndicatorStyle={{ backgroundColor: Colors[theme].icon }}
      backgroundStyle={{ backgroundColor: Colors[theme].background }}
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors[theme].text,
            }}
          >
            Log a Spot
          </Text>
          <Pressable
            onPress={() => {
              resetForm();
              onOpenChange(false);
            }}
            style={{
              height: 32,
              width: 32,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e5e5e5',
            }}
          >
            <Feather name="x" size={18} color={Colors[theme].icon} />
          </Pressable>
        </View>

        <BottomSheetFlatList
          ref={listRef}
          data={tags}
          keyExtractor={(item: string) => item}
          numColumns={4}
          columnWrapperStyle={{
            flexWrap: 'wrap',
            gap: 8,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 100, // extra space so bottom elements are scrollable
          }}
          ListHeaderComponent={
            <>
              {/* Photos */}
              <Pressable
                onPress={pickPhotos}
                style={{
                  height: 200,
                  borderRadius: 16,
                  borderWidth: photos.length === 0 ? 2 : 0,
                  borderStyle: 'dashed',
                  borderColor: inputBorder,
                  backgroundColor: inputBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {photos.length === 0 ? (
                  <View style={{ alignItems: 'center' }}>
                    <Feather
                      name="camera"
                      size={32}
                      color={Colors[theme].icon}
                      style={{ marginBottom: 8 }}
                    />
                    <Text
                      style={{
                        color: Colors[theme].icon,
                        fontSize: 14,
                      }}
                    >
                      Add photos
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {photos.map((uri) => (
                      <Pressable
                        key={uri}
                        onPress={() => removePhoto(uri)}
                        style={{ marginRight: 8, marginBottom: 8 }}
                      >
                        <Image
                          source={{ uri }}
                          style={{ width: 72, height: 72, borderRadius: 12 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </Pressable>

              {/* Spot Name */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Colors[theme].text,
                    marginBottom: 6,
                  }}
                >
                  Spot Name
                </Text>
                <BottomSheetTextInput
                  value={spotName}
                  onChangeText={setSpotName}
                  placeholder="Enter the name of the place"
                  placeholderTextColor={Colors[theme].icon}
                  style={{
                    backgroundColor: inputBg,
                    color: Colors[theme].text,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>

              {/* Location */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Colors[theme].text,
                    marginBottom: 6,
                  }}
                >
                  Location
                </Text>
                <GooglePlacesAutocomplete
                  ref={placesRef}
                  placeholder="Search for a place"
                  fetchDetails
                  minLength={2}
                  enablePoweredByContainer={false}
                  keyboardShouldPersistTaps="handled"
                  // Important: make dropdown taps count as inside, not outside
                  listViewDisplayed="auto"
                  nearbyPlacesAPI="GooglePlacesSearch"
                  debounce={200}
                  onPress={(data, details) => {
                    const full =
                      data.description || data.structured_formatting?.main_text || '';
                    setLocationName(full);
                    // force the chosen text to stay visible
                    placesRef.current?.setAddressText(full);

                    if (details?.geometry?.location) {
                      setCoordinates({
                        lat: details.geometry.location.lat,
                        lng: details.geometry.location.lng,
                      });
                    }
                  }}
                  query={{
                    key: GOOGLE_MAPS_KEY,
                    language: 'en',
                  }}
                  textInputProps={{
                    placeholderTextColor: Colors[theme].icon,
                  }}
                  styles={{
                    textInput: {
                      backgroundColor: '#181b1f',
                      color: Colors[theme].text,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: '#26292e',
                    },
                    listView: {
                      backgroundColor: Colors[theme].background,
                      zIndex: 1000,
                      elevation: 3,
                    },
                    row: {
                      backgroundColor: Colors[theme].background,
                    },
                    description: {
                      color: Colors[theme].text,
                    },
                  }}
                />
              </View>

              {/* Rating display */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Colors[theme].text,
                    marginBottom: 4,
                  }}
                >
                  Rating
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: Colors[theme].tint,
                  }}
                >
                  {generatedRating != null ? generatedRating.toFixed(1) : '—'}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors[theme].icon,
                    marginTop: 2,
                  }}
                >
                  Uses your AI score if available, otherwise a default rating.
                </Text>
              </View>

              {/* Tags header */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: Colors[theme].text,
                  marginBottom: 8,
                }}
              >
                Tags
              </Text>
            </>
          }
          renderItem={({ item }: { item: string }) => renderTagItem({ item })}
          ListFooterComponent={
            <>
              {/* Reflection */}
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Colors[theme].text,
                    marginBottom: 6,
                  }}
                >
                  Your Reflection
                </Text>
                <BottomSheetTextInput
                  value={review}
                  onChangeText={setReview}
                  placeholder="Share your experience..."
                  placeholderTextColor={Colors[theme].icon}
                  multiline
                  style={{
                    backgroundColor: inputBg,
                    color: Colors[theme].text,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  marginTop: 20,
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: inputBg,
                  opacity: isLoading ? 0.8 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    {statusText}
                  </Text>
                )}
              </Pressable>

              <FooterSpacer />
            </>
          }
        />
      </View>
    </BottomSheetModal>
  );
}
