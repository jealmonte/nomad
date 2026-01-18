// components/tabs/profile-tab.tsx
import {
  RankedSpotCard,
  type RankedSpotCardProps,
} from "@/components/cards/ranked-spot-card";
import { getCurrentUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const images = {
  fushimi: require("@/assets/images/fushimi-inari-torii.jpg"),
  cafe: require("@/assets/images/cafe-central-vienna.jpg"),
  sushi: require("@/assets/images/sushi-restaurant-tokyo.jpg"),
  plitvice: require("@/assets/images/plitvice-lakes-waterfall.jpg"),
  angkor: require("@/assets/images/angkor-wat-sunrise.jpg"),
};

const rankedSpots: RankedSpotCardProps[] = [
  {
    rank: 1,
    name: "Fushimi Inari Shrine",
    location: "Kyoto, Japan",
    image: images.fushimi,
    aiScore: 9.8,
    tag: "temples",
  },
  {
    rank: 2,
    name: "Café Central",
    location: "Vienna, Austria",
    image: images.cafe,
    aiScore: 9.6,
    tag: "coffee",
  },
  {
    rank: 3,
    name: "Sukiyabashi Jiro",
    location: "Tokyo, Japan",
    image: images.sushi,
    aiScore: 9.5,
    tag: "food",
  },
  {
    rank: 4,
    name: "Plitvice Lakes",
    location: "Croatia",
    image: images.plitvice,
    aiScore: 9.4,
    tag: "nature",
  },
  {
    rank: 5,
    name: "Angkor Wat",
    location: "Siem Reap, Cambodia",
    image: images.angkor,
    aiScore: 9.3,
    tag: "temples",
  },
];

const SLOGAN = "discover your perfect spots with AI-powered recommendations";

async function handleShare(inviteCode: string) {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert("Not supported", "SMS is not available on this device.");
    return;
  }

  const message = `Join me on Nomad to ${SLOGAN}.\n\nUse my invite code: ${inviteCode}`;
  await SMS.sendSMSAsync([], message);
}

type ProfileTabProps = {
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenSpots?: () => void;
  profile: {
    first_name: string;
    last_name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    followers: number;
    following: number;
    countries: number;
    cities: number;
    spots: number;
    avgScore: number;
    topTags: string[];
  };
};

type ListItem = { type: "content"; id: "content" };
const listData: ListItem[] = [{ type: "content", id: "content" }];

export function ProfileTab({
  onLogout,
  onOpenSettings,
  onOpenSpots,
  profile,
}: ProfileTabProps) {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const handle = `@${profile.username}`;
  const inviteCode = `NOMAD-${profile.username.slice(0, 4).toUpperCase()}`;

  const [spotCount, setSpotCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [derivedCountries, setDerivedCountries] = useState(0);
  const [derivedCities, setDerivedCities] = useState(0);

  const [tooltip, setTooltip] = useState<{
    label: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = await getCurrentUserId();

      if (!userId) {
        console.error("PROFILE stats: no auth user");
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          auto_score,
          spot:spot_id (
            city,
            country
          )
        `,
        )
        .eq('user_id', userId);

      if (error || !data) {
        console.error('PROFILE stats error', error);
        return;
      }

      setSpotCount(data.length);

      if (data.length > 0) {
        const sum = data.reduce(
          (acc: number, row: any) => acc + (row.auto_score ?? 0),
          0,
        );
        setAvgScore(Number((sum / data.length).toFixed(1)));
      } else {
        setAvgScore(0);
      }

      const countrySet = new Set<string>();
      const citySet = new Set<string>();

      data.forEach((row: any) => {
        const country = row.spot?.country?.trim();
        const city = row.spot?.city?.trim();

        if (country) countrySet.add(country);
        if (city) citySet.add(city);
      });

      setDerivedCountries(countrySet.size);
      setDerivedCities(citySet.size);
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!tooltip) return;
    const id = setTimeout(() => setTooltip(null), 3000);
    return () => clearTimeout(id);
  }, [tooltip]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={listData}
        stickyHeaderIndices={[0]}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-6"
        ListHeaderComponent={
          <View className="bg-background py-3 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {/* Logout button */}
                <Pressable
                  onPress={onLogout}
                  className="h-10 w-10 rounded-full items-center justify-center bg-secondary"
                >
                  <Feather name="log-out" size={18} color="#fff" />
                </Pressable>
                <Text className="text-2xl font-bold tracking-tight text-foreground">
                  Profile
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  className="h-10 w-10 rounded-full items-center justify-center bg-secondary"
                  onPress={() => handleShare(inviteCode)}
                >
                  <Feather name="share-2" size={18} color="#fff" />
                </Pressable>
                <Pressable
                  className="h-10 w-10 rounded-full items-center justify-center bg-secondary"
                  onPress={onOpenSettings}
                >
                  <Feather name="settings" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        }
        renderItem={() => (
          <View className="py-4 gap-6">
            {/* Profile row */}
            <View className="flex-row items-center gap-4">
              {profile.avatar_url ? (
                <Image
                  key={profile.avatar_url}
                  source={{ uri: profile.avatar_url }}
                  className="h-20 w-20 rounded-full border-2 border-primary"
                  resizeMode="cover"
                  style={{ backgroundColor: "transparent" }}
                />
              ) : (
                <View className="h-20 w-20 rounded-full border-2 border-primary items-center justify-center bg-secondary">
                  <Feather name="user" size={32} color="#fff" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {fullName}
                </Text>
                <Text className="text-sm text-muted-foreground">{handle}</Text>
                {profile.bio ? (
                  <Text className="text-sm text-foreground mt-1">
                    {profile.bio}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Followers / following */}
            <View className="flex-row gap-6">
              <Pressable className="items-center">
                <Text className="text-lg font-bold text-foreground">
                  {profile.followers.toLocaleString()}
                </Text>
                <Text className="text-xs text-muted-foreground">Followers</Text>
              </Pressable>
              <Pressable className="items-center">
                <Text className="text-lg font-bold text-foreground">
                  {profile.following.toLocaleString()}
                </Text>
                <Text className="text-xs text-muted-foreground">Following</Text>
              </Pressable>
            </View>

            {/* Stat cards */}
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                icon="globe"
                label="Countries"
                value={derivedCountries}
                onPress={() =>
                  setTooltip((current) =>
                    current?.label === 'Countries'
                      ? null
                      : {
                          label: 'Countries',
                          message:
                            'Unique countries where you have logged at least one spot.',
                        },
                  )
                }
                tooltip={tooltip?.label === 'Countries' ? tooltip.message : undefined}
              />

              <StatCard
                icon="map-pin"
                label="Cities"
                value={derivedCities}
                onPress={() =>
                  setTooltip((current) =>
                    current?.label === 'Cities'
                      ? null
                      : {
                          label: 'Cities',
                          message:
                            'Unique cities where you have logged at least one spot.',
                        },
                  )
                }
                tooltip={tooltip?.label === 'Cities' ? tooltip.message : undefined}
              />

              {/* Spots Logged – tap to open SpotsLoggedTab */}
              <StatCard
                icon="star"
                label="Spots Logged"
                value={spotCount}
                onPress={onOpenSpots}
              />
            <StatCard
              icon="users"
              label="Avg Score"
              value={avgScore}
              onPress={() =>
                setTooltip((current) =>
                  current?.label === 'Avg Score'
                    ? null
                    : {
                        label: 'Avg Score',
                        message: 'Average AI score across all spots you have logged.',
                      },
                )
              }
              tooltip={tooltip?.label === 'Avg Score' ? tooltip.message : undefined}
              tooltipPosition="bottom"
            />
            </View>
          </View>

            {/* Taste profile tags */}
            <View>
              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                TASTE PROFILE
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.topTags.map((tag) => (
                  <View
                    key={tag}
                    className="bg-secondary rounded-full px-3 py-1"
                  >
                    <Text className="text-secondary-foreground text-xs">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top 5 spots */}
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Your Top Spots
              </Text>
              <View className="gap-2">
                {rankedSpots.map((spot) => (
                  <RankedSpotCard key={spot.rank} {...spot} />
                ))}
              </View>
            </View>

            {/* Invite block */}
            <View className="p-4 rounded-xl border border-primary/30 bg-primary/10">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-semibold text-foreground">
                    Invite Friends
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Share your invite code
                  </Text>
                </View>
                <Pressable className="rounded-full bg-secondary px-3 py-2">
                  <Text className="text-secondary-foreground font-semibold">
                    {inviteCode}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
  onPress,
  tooltip,
  tooltipPosition,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  onPress?: () => void;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom'
}) {
  const Wrapper: React.ComponentType<any> = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress } : {};

  const isBottom = tooltipPosition === 'bottom';

  return (
    <View className="w-[48%] relative">
      <Wrapper {...wrapperProps}>
        <View className="bg-card border border-border rounded-xl p-4 w-full min-h-[80px]">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
              <Feather name={icon} size={18} color="#33d6b3" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-foreground">{value}</Text>
              <Text className="text-xs text-muted-foreground">{label}</Text>
            </View>
          </View>
        </View>
      </Wrapper>

      {tooltip ? (
        <View
          className={[
            'px-3 py-2 rounded-lg bg-card border border-border flex-row items-center shadow-lg',
            isBottom
              ? 'absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full'
              : 'absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full',
          ].join(' ')}
        >
          <View className="mr-2 h-2 w-2 rounded-full bg-primary" />
          <Text className="text-xs text-muted-foreground flex-1">{tooltip}</Text>
        </View>
      ) : null}
    </View>
  );
}
