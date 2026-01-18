import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

// --- API CONFIGURATION ---
const TOKEN_COMPANY_KEY = process.env.EXPO_PUBLIC_TOKEN_API_KEY;
const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PPLX_API_KEY;
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const COMPRESS_ENDPOINT = 'https://api.thetokencompany.com/v1/compress';
const PERPLEXITY_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

type LogSpotSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const tags = ['temples', 'coffee', 'food', 'nightlife', 'nature', 'museums', 'beaches', 'markets'];

// ✅ 1. Define Spacer Component outside to keep List clean
const FooterSpacer = () => <View style={{ height: 400 }} />;

export function LogSpotSheet({ open, onOpenChange }: LogSpotSheetProps) {
  const listRef = useRef<any>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  
  const snapPoints = useMemo(() => ['90%'], []);
  const theme = useColorScheme() ?? 'light';

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Log This Spot'); 
  
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

  // ✅ 2. Helper to clear everything
  const resetForm = () => {
    setSpotName('');
    setReview('');
    setSelectedTags([]);
    setPhotos([]);
    setLocationName('');
    setCoordinates(null);
    setGeneratedRating(null);
    setStatusText('Log This Spot');
    // Clear the Google Input text manually
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
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleLogSpot = async () => {
    if (!spotName || !review || !locationName) {
      Alert.alert('Missing Info', 'Please add a name, location, and review.');
      return;
    }

    if (!TOKEN_COMPANY_KEY || !PERPLEXITY_API_KEY) {
       Alert.alert("Configuration Error", "API Keys are missing.");
       return;
    }

    setIsLoading(true);
    setGeneratedRating(null);

    const rawInput = JSON.stringify({
        spot_name: spotName,
        location: locationName,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        tags: selectedTags.join(', '),
        review_text: review,
        photo_count: photos.length
    });

    try {
      setStatusText('Compressing...');
      const compressRes = await fetch(COMPRESS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN_COMPANY_KEY}`,
        },
        body: JSON.stringify({
          model: 'bear-1',
          compression_settings: { aggressiveness: 0.5, max_output_tokens: null, min_output_tokens: null },
          input: rawInput,
        }),
      });

      const compressData = await compressRes.json();
      if (!compressData.output) throw new Error('Compression failed');
      const compressedText = compressData.output;

      setStatusText('Rating...');
      const prompt = `
        Read this compressed location review: "${compressedText}".
        Based on the sentiment, give it a specific rating from 0.0 to 10.0.
        Return ONLY the number.
      `;

      const pplxRes = await fetch(PERPLEXITY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that returns only numeric ratings.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });

      const pplxData = await pplxRes.json();
      if (pplxData.error) throw new Error(`Perplexity Error: ${pplxData.error.message}`);
      const ratingString = pplxData?.choices?.[0]?.message?.content;
      if (!ratingString) throw new Error("No rating generated.");
      const numberMatch = ratingString.match(/(\d+(\.\d+)?)/);
      const finalRating = numberMatch ? parseFloat(numberMatch[0]) : 0.0;
      
      setGeneratedRating(finalRating);
      
      // ✅ 3. Success Sequence
      setStatusText('Success!'); // Visual feedback
      
      setTimeout(() => {
        // Close the sheet
        onOpenChange(false);
        
        // Clear form (delayed slightly to prevent visual flash before closing)
        setTimeout(() => {
            resetForm();
        }, 300);
      }, 500);

    } catch (error: any) {
      console.error("LogSpot Error:", error);
      Alert.alert('Error', error.message || 'Something went wrong.');
      setStatusText('Log This Spot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewFocus = () => {
    setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 225, animated: true });
    }, 400);
  };

  const handleLocationFocus = () => {
    setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 150, animated: true });
    }, 200);
  };

  const renderFormContent = () => (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-foreground">Log a Spot</Text>
        <Pressable
          onPress={() => onOpenChange(false)}
          className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Feather name="x" size={18} color={Colors[theme].text} />
        </Pressable>
      </View>

      {/* Photos */}
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

      {/* Spot Name: zIndex: 1 to stay behind Location dropdown */}
      <View className="mt-6" style={{ zIndex: 1 }}>
        <Text className="text-sm font-medium text-foreground mb-2">Spot Name</Text>
        <BottomSheetTextInput
          value={spotName}
          onChangeText={setSpotName}
          placeholder="Enter the name of the place"
          placeholderTextColor={Colors[theme].icon}
          className="bg-muted rounded-xl px-4 py-3 text-foreground"
        />
      </View>

      {/* LOCATION WITH GOOGLE PLACES */}
      <View className="mt-4" style={{ zIndex: 100 }}>
        <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
        <GooglePlacesAutocomplete
          ref={placesRef}
          placeholder="City, Country"
          fetchDetails={true}
          onFail={(error) => console.error("Google Places Error:", error)}
          onNotFound={() => console.log("No results found")}
          onPress={(data, details = null) => {
            const lat = details?.geometry?.location.lat || 0;
            const lng = details?.geometry?.location.lng || 0;
            setCoordinates({ lat, lng });
            setLocationName(data.description);
            setTimeout(() => {
              placesRef.current?.setAddressText(data.description);
            }, 50);
          }}
          query={{
            key: GOOGLE_MAPS_KEY,
            language: 'en',
            types: '(cities)',
          }}
          // @ts-ignore
          flatListProps={{
            scrollEnabled: false,
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: 'always',
          }}
          textInputProps={{
            placeholderTextColor: Colors[theme].icon,
            returnKeyType: "search",
            onFocus: handleLocationFocus,
            value: locationName,
            onChangeText: (text) => setLocationName(text),
          }}
          styles={{
            container: { flex: 0 },
            textInputContainer: {
              width: '100%',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              padding: 0,
            },
            textInput: {
              backgroundColor: theme === 'dark' ? '#181B1F' : '#f4f4f5', 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              fontSize: 14,
              color: Colors[theme].text, 
              height: undefined, 
              marginBottom: 0,
            },
            listView: {
              zIndex: 2000, 
              position: 'absolute',
              bottom: 55, 
              left: 0,
              right: 0,
              top: undefined,
              backgroundColor: Colors[theme].background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors[theme].icon, 
              opacity: 1,
              elevation: 10,
            },
            row: {
              backgroundColor: 'transparent',
              padding: 13,
            },
            description: {
              color: Colors[theme].text,
            },
            separator: {
              backgroundColor: Colors[theme].icon,
              height: 0.5,
              opacity: 0.2,
            }
          }}
          enablePoweredByContainer={false}
        />
      </View>

      {/* Tags */}
      <View className="mt-4" style={{ zIndex: -1 }}>
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

      {/* Review */}
      <View className="mt-4">
        <Text className="text-sm font-medium text-foreground mb-2">Your Review</Text>
        <BottomSheetTextInput
          value={review}
          onChangeText={setReview}
          onFocus={handleReviewFocus} 
          placeholder="Share your experience..."
          placeholderTextColor={Colors[theme].icon}
          multiline
          textAlignVertical="top"
          className="bg-muted rounded-xl px-4 py-3 text-foreground min-h-[100px]"
        />
      </View>

      {/* Action Button */}
      <Pressable 
        onPress={handleLogSpot}
        disabled={isLoading}
        className={`mt-6 h-12 rounded-xl bg-primary items-center justify-center flex-row gap-2 ${isLoading ? 'opacity-70' : ''}`}>
        {isLoading && <ActivityIndicator color="#fff" />}
        <Text className="text-primary-foreground font-semibold">{statusText}</Text>
      </Pressable>
    </View>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={() => onOpenChange(false)}
      backgroundStyle={{ backgroundColor: Colors[theme].background }}
      handleIndicatorStyle={{ backgroundColor: Colors[theme].icon }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize" 
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}>
        
      <BottomSheetFlatList
        ref={listRef}
        data={[]} 
        renderItem={null}
        ListHeaderComponent={renderFormContent()} 
        // ✅ 5. Add Spacer as Footer and reduce container padding
        ListFooterComponent={FooterSpacer} 
        contentContainerStyle={{ padding: 16 }} 
        keyboardShouldPersistTaps="always"
      />

    </BottomSheetModal>
  );
}