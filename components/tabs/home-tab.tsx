import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpotCard } from "@/components/cards/spot-card";
import { LogSpotSheet } from "@/components/sheets/log-spot-sheet";
import { NewTripSheet } from "@/components/sheets/new-trip-sheet";
import { getCurrentUserId } from "@/lib/auth";
import { getImagePublicUrl } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { getLucky } from "@/services/woodwide";

// --- Local images for fallback feed + Get Lucky ---
const images = {
  sarah: require("@/assets/images/diverse-woman-avatar.png"),
  marco: require("@/assets/images/man-avatar-beard.png"),
  emma: require("@/assets/images/woman-blonde-avatar.jpg"),
  senso: require("@/assets/images/senso-ji-temple-tokyo.jpg"),
  cafe: require("@/assets/images/cafe-de-flore-paris.jpg"),
  fushimi: require("@/assets/images/fushimi-inari-shrine-gates.jpg"),
};

const locationImages = [images.senso, images.cafe, images.fushimi];

// --- Types ---
type FeedPost = {
  id: string;
  user: { name: string; handle: string; avatar: any };
  spot: {
    name: string;
    location: string;
    image: any;
    aiScore: number;
    tags: string[];
  };
  review: string;
  photos: number;
  timestamp: string;
};

type ActionRow = { type: "actions"; id: "actions" };
type ListItem = ActionRow | FeedPost;

export function HomeTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogSpot, setShowLogSpot] = useState(false);
  const [showTriageSheet, setShowTriageSheet] = useState(false);
  const [newLoggedSpot, setNewLoggedSpot] = useState<any>(null);
  const [showNewTripSheet, setShowNewTripSheet] = useState(false);

  const [isLuckyLoading, setIsLuckyLoading] = useState(false);
  const [luckySpot, setLuckySpot] = useState<any>(null);
  const [userSpotCount, setUserSpotCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
          id, user_id, auto_score, reflection, photos_count, created_at,
          user:user_id (name, handle, avatar_url),
          spot:spot_id (name, city, country, category, image_url)
        `,
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const mapped: FeedPost[] = data.map((row: any) => {
      const avatarUrl = getImagePublicUrl(row.user?.avatar_url);
      const spotUrl = getImagePublicUrl(row.spot?.image_url);

      let aiScore: number | string = row.auto_score ?? 0;
      if (row.user_id === currentUserId && userSpotCount < 5) {
        aiScore = "?";
      }

      return {
        id: row.id,
        user: {
          name: row.user?.name ?? "Traveler",
          handle: row.user?.handle ?? "@nomad",
          avatar: avatarUrl ? { uri: avatarUrl } : null,
        },
        spot: {
          name: row.spot?.name ?? "Unknown spot",
          location: row.spot
            ? `${row.spot.city ?? ""}${row.spot.country ? `, ${row.spot.country}` : ""}`
            : "",
          image: spotUrl ? { uri: spotUrl } : null,
          aiScore: aiScore as number,
          tags: row.spot?.category ? [row.spot.category] : [],
        },
        review: row.reflection ?? "",
        photos: row.photos_count ?? 0,
        timestamp: row.created_at
          ? new Date(row.created_at).toLocaleString()
          : "",
      };
    });

    setPosts(mapped);
    setLoading(false);
  };

  const fetchUserData = async () => {
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      if (!userId) return;

      const { count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (!error && count !== null) {
        setUserSpotCount(count);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchUserData();
  }, []);

  const listData: ListItem[] = useMemo(
    () => [{ type: "actions", id: "actions" }, ...posts],
    [posts],
  );

  const handleGetLucky = async () => {
    setIsLuckyLoading(true);
    setLuckySpot(null);
    try {
      const spot = await getLucky();
      const rawScore = (spot.compatibilityScore || 0) * 100;
      const randomImg =
        locationImages[Math.floor(Math.random() * locationImages.length)];
      setLuckySpot({
        ...spot,
        image: randomImg,
        matchReason: `AI Match: ${rawScore > 99 ? 99 : rawScore.toFixed(0)}%`,
        distance:
          typeof spot.distance === "number"
            ? `${spot.distance} km`
            : spot.distance,
      });
    } catch (e) {
      Alert.alert("AI Error", "Could not find a lucky spot.");
    } finally {
      setIsLuckyLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={listData}
        keyExtractor={(item) => ("type" in item ? item.id : String(item.id))}
        stickyHeaderIndices={[0]}
        contentContainerClassName="px-4 pb-6"
        ListHeaderComponent={
          <View className="bg-background py-3 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  Nomad
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Your travel feed
                </Text>
              </View>
              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <MaterialIcons name="auto-awesome" size={20} color="#33d6b3" />
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if ("type" in item) {
            return (
              <View className="py-4 flex-row gap-3">
                <Pressable
                  onPress={() => setShowLogSpot(true)}
                  className="flex-1 h-12 rounded-xl bg-primary items-center justify-center flex-row"
                >
                  <Feather name="plus" size={18} color="#0f1116" />
                  <Text className="ml-2 text-primary-foreground font-semibold">
                    Log a Spot
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleGetLucky}
                  disabled={isLuckyLoading}
                  className={`flex-1 h-12 rounded-xl bg-secondary items-center justify-center flex-row ${isLuckyLoading ? "opacity-80" : ""}`}
                >
                  {isLuckyLoading ? (
                    <ActivityIndicator size="small" color="#33d6b3" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="auto-awesome"
                        size={20}
                        color="#33d6b3"
                      />
                      <Text className="ml-2 text-secondary-foreground font-semibold">
                        Get Lucky
                      </Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setShowNewTripSheet(true)}
                  className="h-12 w-12 rounded-xl bg-secondary items-center justify-center"
                >
                  <Ionicons name="airplane" size={18} color="#fff" />
                </Pressable>
              </View>
            );
          }
          return <SpotCard {...item} />;
        }}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null
        }
      />

      {/* MODALS & SHEETS */}
      <LogSpotSheet
        open={showLogSpot}
        onOpenChange={async (open) => {
          setShowLogSpot(open);
          if (!open) {
            // sheet just closed – refresh feed
            await fetchFeed();
          }
        }}
      />

      <NewTripSheet
        open={showNewTripSheet}
        onOpenChange={setShowNewTripSheet}
      />

      <Modal visible={!!luckySpot} animationType="slide" transparent>
        {/* ... Lucky Modal Content (Keep as you have it) ... */}
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 min-h-[50%]">
            <Pressable
              onPress={() => setLuckySpot(null)}
              style={{ alignSelf: "flex-end" }}
            >
              <Feather name="x" size={24} color="#fff" />
            </Pressable>
            {luckySpot && <Text className="text-white">{luckySpot.name}</Text>}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
