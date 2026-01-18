// components/sheets/log-spot-sheet.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ensureUserExists, getCurrentUserId } from "@/lib/auth";
import { saveSpot } from "@/lib/db/spots";
import { supabase } from "@/lib/supabase";
import type { Spot } from "@/lib/types/spot";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  LogBox, // <--- 1. Import LogBox
  Pressable,
  Text,
  View
} from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";

// --- API CONFIGURATION ---
const TOKEN_COMPANY_KEY = process.env.EXPO_PUBLIC_TOKEN_API_KEY;
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  "Food",
  "Nightlife",
  "Nature",
  "Adventure",
  "Markets",
  "Arts",
  "Family",
  "Music",
];

// --- Helper to Upload Image ---
const uploadImage = async (uri: string, userId: string) => {
  try {
    const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `spots/${userId}/${fileName}`;
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: `image/${ext}`,
    } as any);
    const { data, error } = await supabase.storage
      .from("images") // Ensure this matches your bucket name ('images' or 'spots')
      .upload(filePath, formData);
    if (error) throw error;
    return data.path;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export function LogSpotSheet({
  open,
  onOpenChange,
  initialSpot,
}: LogSpotSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);

  const snapPoints = useMemo(() => ["90%"], []);
  const theme = useColorScheme() ?? "light";

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Log This Spot");
  const [spotCount, setSpotCount] = useState(0);

  // Colors
  const inputBg = "#181b1f";
  const inputBorder = "#26292e";

  const [spotName, setSpotName] = useState("");
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [generatedRating, setGeneratedRating] = useState<number | null>(null);

  // 2. Suppress the nested list warning for this component
  useEffect(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
  }, []);

  // Fetch user's spot count
  useEffect(() => {
    const fetchSpotCount = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        
        const { data, error } = await supabase
          .from("posts")
          .select("id")
          .eq("user_id", userId);
        
        if (!error && data) {
          setSpotCount(data.length);
        }
      } catch (err) {
        console.error("Error fetching spot count:", err);
      }
    };
    
    if (open) {
      fetchSpotCount();
    }
  }, [open]);

  useEffect(() => {
    if (open) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [open]);

  useEffect(() => {
    if (!open || !initialSpot) return;
    setSpotName(initialSpot.name ?? "");
    setReview("");
    setSelectedTags(
      initialSpot.tags
        ? initialSpot.tags.filter((tag) => tags.includes(tag))
        : [],
    );
    setPhotos([]);
    setLocationName(initialSpot.location ?? "");
    setCoordinates(null);
    setGeneratedRating(null);
    setStatusText("Log This Spot");

    if (initialSpot.location) {
      placesRef.current?.setAddressText(initialSpot.location);
    }
  }, [open, initialSpot]);

  const resetForm = () => {
    setSpotName("");
    setReview("");
    setSelectedTags([]);
    setCustomTags([]);
    setCustomTagInput("");
    setPhotos([]);
    setLocationName("");
    setCoordinates(null);
    setGeneratedRating(null);
    setStatusText("Log This Spot");
    placesRef.current?.setAddressText("");
  };

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
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
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const trimmedTag = customTagInput.trim();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      setCustomTags((prev) => [...prev, trimmedTag]);
      setCustomTagInput("");
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const getFinalRating = () => {
    if (generatedRating != null) return generatedRating;
    const r = 7.5 + Math.random() * 2.3;
    return Number(r.toFixed(1));
  };

  const handleSubmit = async () => {
    if (!spotName.trim()) {
      Alert.alert("Missing name", "Please enter a spot name before logging.");
      return;
    }
    setIsLoading(true);
    setStatusText("Saving...");

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert("Not signed in", "You must be logged in to log a spot.");
        setStatusText("Log This Spot");
        setIsLoading(false);
        return;
      }

      await ensureUserExists(userId);

      let uploadedImagePath: string | undefined = undefined;
      if (photos.length > 0) {
        try {
          const localUri = photos[0];
          uploadedImagePath = await uploadImage(localUri, userId);
        } catch (e) {
          Alert.alert(
            "Upload Failed",
            "Could not upload the image. Saving spot without it.",
          );
        }
      }

      let city = "New York";
      let country = "USA";

      if (locationName) {
        const parts = locationName.split(",").map((s) => s.trim());
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
        id: "",
        userId,
        metadata: {
          name: spotName.trim(),
          category: selectedTags[0] ?? "food",
          location: {
            city,
            country,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
          },
          priceRange: 2,
          visitDate: nowIso,
          imageUrl: uploadedImagePath,
        },
        reflection: review.trim(),
        autoScore,
        reasoning: undefined,
        createdAt: nowIso,
        photosCount: photos.length,
      };

      await saveSpot(spot);

      setStatusText("Saved!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("[handleSubmit] Error saving spot:", err);
      let errorMsg = err?.message || "Unknown error";
      if (err?.code === "23503" || errorMsg.includes("foreign key")) {
        errorMsg = "User profile not found. Please ensure you're logged in.";
      }
      Alert.alert("Error", `Could not save this spot: ${errorMsg}`);
      setStatusText("Log This Spot");
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
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Header Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
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
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e5e5e5",
            }}
          >
            <Feather name="x" size={18} color={Colors[theme].icon} />
          </Pressable>
        </View>

        {/* 2. Photos Section */}
        <Pressable
          onPress={pickPhotos}
          style={{
            height: 200,
            borderRadius: 16,
            borderWidth: photos.length === 0 ? 2 : 0,
            borderStyle: "dashed",
            borderColor: inputBorder,
            backgroundColor: inputBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {photos.length === 0 ? (
            <View style={{ alignItems: "center" }}>
              <Feather
                name="camera"
                size={32}
                color={Colors[theme].icon}
                style={{ marginBottom: 8 }}
              />
              <Text style={{ color: Colors[theme].icon, fontSize: 14 }}>
                Add photos
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
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

        {/* 3. Spot Name Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
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

        {/* 4. Location Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
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
            listViewDisplayed="auto"
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={200}
            onPress={(data, details) => {
              const full =
                data.description || data.structured_formatting?.main_text || "";
              setLocationName(full);
              placesRef.current?.setAddressText(full);
              if (details?.geometry?.location) {
                setCoordinates({
                  lat: details.geometry.location.lat,
                  lng: details.geometry.location.lng,
                });
              }
            }}
            query={{ key: GOOGLE_MAPS_KEY, language: "en" }}
            textInputProps={{ placeholderTextColor: Colors[theme].icon }}
            styles={{
              textInput: {
                backgroundColor: "#181b1f",
                color: Colors[theme].text,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#26292e",
              },
              listView: {
                backgroundColor: Colors[theme].background,
                zIndex: 1000,
                elevation: 3,
              },
              row: { backgroundColor: Colors[theme].background },
              description: { color: Colors[theme].text },
            }}
          />
        </View>

        {/* 5. Rating Section */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: Colors[theme].text,
              marginBottom: 4,
            }}
          >
            Rating
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: Colors[theme].tint,
            }}
          >
            {generatedRating != null ? generatedRating.toFixed(1) : "—"}
          </Text>
          <Text
            style={{ fontSize: 12, color: Colors[theme].icon, marginTop: 2 }}
          >
            Uses your AI score if available, otherwise a default rating.
          </Text>
        </View>

        {/* 6. Tags Section */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: Colors[theme].text,
              marginBottom: 8,
            }}
          >
            Tags
          </Text>

          {/* Custom Tag Input */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <BottomSheetTextInput
              value={customTagInput}
              onChangeText={setCustomTagInput}
              placeholder="Add a custom tag"
              placeholderTextColor={Colors[theme].icon}
              blurOnSubmit={false}
              onSubmitEditing={addCustomTag}
              style={{
                flex: 1,
                backgroundColor: inputBg,
                color: Colors[theme].text,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: inputBorder,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            />
            <Pressable
              onPress={addCustomTag}
              style={{
                backgroundColor: "#10b981",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="plus" size={18} color="#000" />
            </Pressable>
          </View>

          {/* Custom Tags Display */}
          {customTags.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {customTags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => removeCustomTag(tag)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "#10b981",
                  }}
                >
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 13,
                    }}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Preset Tags */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? "#10b981" : inputBg,
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#000" : Colors[theme].text,
                      fontSize: 13,
                    }}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 7. Reflection Input */}
        <View style={{ marginTop: 0, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
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
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* 8. Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            height: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: inputBorder,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#10b981",
            opacity: isLoading ? 0.8 : 1,
            marginBottom: 50,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: "#000", fontSize: 16, fontWeight: "600" }}>
              {statusText}
            </Text>
          )}
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
