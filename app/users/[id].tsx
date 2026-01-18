// app/users/[id].tsx
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type PublicProfileRow = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  followers?: number;
  // optional stats if you add them later
  countries?: number | null;
  cities?: number | null;
  spots?: number | null;
  avgScore?: number | null;
  top_tags?: string[] | null;
};

type LoggedSpotRow = {
  id: string;
  auto_score: number | null;
  reflection: string | null;
  photos_count: number | null;
  created_at: string | null;
  spot: {
    name: string | null;
    city: string | null;
    country: string | null;
    image_url: string | null;
  } | null;
};

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme: 'light' | 'dark' = colorScheme;

  const [profile, setProfile] = useState<PublicProfileRow | null>(null);
  const [spots, setSpots] = useState<LoggedSpotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);

      // profile (same shape you had before)
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, bio')
        .eq('id', id)
        .maybeSingle<PublicProfileRow>();

      if (profileRow) {
        const { data: followerRows } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', profileRow.id);

        const followersCount = followerRows ? followerRows.length : 0;
        setProfile({ ...profileRow, followers: followersCount });
      } else {
        setProfile(null);
      }

      const currentUserId = await getCurrentUserId();

      // follow status
      if (currentUserId && profileRow) {
        const { data: followRow } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUserId)
          .eq('following_id', profileRow.id)
          .maybeSingle();

        setIsFollowing(!!followRow);
      }

      // that user's spots
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          id,
          auto_score,
          reflection,
          photos_count,
          created_at,
          spot:spot_id (
            name,
            city,
            country,
            image_url
          )
        `,
        )
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (postsError || !postsData) {
        console.error('PUBLIC PROFILE spots error', postsError);
        setSpots([]);
      } else {
        const normalized = (postsData as any[]).map((row) => ({
          ...row,
          spot: Array.isArray(row.spot) ? row.spot[0] ?? null : row.spot ?? null,
        }));
        setSpots(normalized);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const toggleFollow = async () => {
    if (!profile || followLoading) return;
    const currentUserId = await getCurrentUserId();
    if (!currentUserId || currentUserId === profile.id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id);
        setIsFollowing(false);
        setProfile((prev) =>
          prev
            ? { ...prev, followers: Math.max(0, (prev.followers ?? 1) - 1) }
            : prev,
        );
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: profile.id });
        setIsFollowing(true);
        setProfile((prev) =>
          prev ? { ...prev, followers: (prev.followers ?? 0) + 1 } : prev,
        );
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const renderSpot = ({ item }: { item: LoggedSpotRow }) => {
    const name = item.spot?.name ?? 'Unknown spot';
    const city = item.spot?.city ?? '';
    const country = item.spot?.country ?? '';
    const location = [city, country].filter(Boolean).join(', ');
    const score = item.auto_score ?? 0;
    const imageUrl = item.spot?.image_url || undefined;
    const photosCount = item.photos_count ?? 0;

    return (
      <View
        style={{
          backgroundColor: '#0f1216',
          borderColor: '#26292e',
          borderWidth: 1,
          borderRadius: 16,
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 12,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: Colors[theme].text,
              }}
              numberOfLines={1}
            >
              {name}
            </Text>
            {location.length > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: Colors[theme].icon,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {location}
              </Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: Colors[theme].background,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              alignSelf: 'flex-start',
            }}
          >
            <Text
              style={{
                color: '#26cb96',
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {score.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#0f1216' }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: 200 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 200,
                backgroundColor: Colors[theme].background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="image" size={24} color={Colors[theme].icon} />
            </View>
          )}
        </View>

        <View style={{ padding: 12 }}>
          {item.reflection && item.reflection.length > 0 && (
            <Text
              style={{
                color: Colors[theme].text,
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              {item.reflection}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors[theme].icon, fontSize: 12 }}>
              {photosCount} photos
            </Text>
            <Text style={{ color: Colors[theme].icon, fontSize: 12 }}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading || !profile) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors[theme].background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={Colors[theme].tint} />
      </SafeAreaView>
    );
  }

  const fullName =
    `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
    profile.username;

  // derive stats from spots until you add DB columns
  const derivedCountries = new Set(
    spots
      .map((s) => s.spot?.country)
      .filter((v): v is string => !!v),
  ).size;
  const derivedCities = new Set(
    spots
      .map((s) => {
        const city = s.spot?.city;
        const country = s.spot?.country;
        return city && country ? `${city},${country}` : null;
      })
      .filter((v): v is string => !!v),
  ).size;
  const spotCount = spots.length;
  const avgScore =
    spots.length > 0
      ? spots.reduce(
          (sum, s) => sum + (typeof s.auto_score === 'number' ? s.auto_score : 0),
          0,
        ) / spots.length
      : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[theme].background }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#26292e',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            height: 32,
            width: 32,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            backgroundColor: '#0f1216',
          }}
        >
          <Feather name="arrow-left" size={20} color={Colors[theme].text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors[theme].text,
            }}
          >
            {fullName}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: Colors[theme].icon,
            }}
          >
            @{profile.username}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: Colors[theme].icon,
              marginTop: 2,
            }}
          >
            {profile.followers ?? 0} followers
          </Text>
        </View>

        <Pressable
          onPress={toggleFollow}
          disabled={followLoading}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: isFollowing ? '#181b1f' : Colors[theme].tint,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {followLoading ? (
            <ActivityIndicator
              size="small"
              color={isFollowing ? Colors[theme].text : '#0f1116'}
            />
          ) : (
            <>
              <Feather
                name={isFollowing ? 'check' : 'user-plus'}
                size={14}
                color={isFollowing ? Colors[theme].text : '#0f1116'}
              />
              <Text
                style={{
                  marginLeft: 6,
                  color: isFollowing ? Colors[theme].text : '#0f1116',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Bio + stats + spots list */}
      {profile.bio ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: Colors[theme].text, fontSize: 13 }}>
            {profile.bio}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        renderItem={renderSpot}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            {/* Stats row */}
            <View className="flex-row flex-wrap gap-3 mb-4">
              <StatCard icon="globe" label="Countries" value={derivedCountries} />
              <StatCard icon="map-pin" label="Cities" value={derivedCities} />
              <StatCard icon="star" label="Spots Logged" value={spotCount} />
              <StatCard
                icon="users"
                label="Avg Score"
                value={Number(avgScore.toFixed(1))}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 40,
            }}
          >
            <Feather name="map-pin" size={28} color={Colors[theme].icon} />
            <Text
              style={{
                marginTop: 8,
                color: Colors[theme].text,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              No spots logged yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <View className="w-[48%]">
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
    </View>
  );
}
