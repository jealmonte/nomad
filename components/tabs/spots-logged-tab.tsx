// components/tabs/spots-logged-tab.tsx
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
    category: string | null;
    image_url: string | null;
  } | null;
};

type SortMode = 'recent' | 'alpha';

type Props = {
  onBack: () => void;
};

export function SpotsLoggedTab({ onBack }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme: 'light' | 'dark' = colorScheme;

  const [spots, setSpots] = useState<LoggedSpotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [search, setSearch] = useState('');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Fetch all posts + spots for this user
  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('SPOTS LOGGED: no auth user');
        setSpots([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
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
            category,
            image_url
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('SPOTS LOGGED error', error);
        setSpots([]);
      } else {
        const normalized = (data as any[]).map((row) => ({
          ...row,
          spot: Array.isArray(row.spot) ? row.spot[0] ?? null : row.spot ?? null,
        }));
        setSpots(normalized);
      }
      setLoading(false);
    };

    fetchSpots();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = spots;
    if (q.length > 0) {
      list = list.filter((row) => {
        const name = row.spot?.name ?? '';
        const city = row.spot?.city ?? '';
        const country = row.spot?.country ?? '';
        const text = `${name} ${city} ${country}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (sortMode === 'alpha') {
      return [...list].sort((a, b) => {
        const an = (a.spot?.name ?? '').toLowerCase();
        const bn = (b.spot?.name ?? '').toLowerCase();
        return an.localeCompare(bn);
      });
    }

    // 'recent' – spots is already ordered by created_at desc
    return list;
  }, [spots, search, sortMode]);

  const renderItem = ({ item }: { item: LoggedSpotRow }) => {
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
        {/* Header: name + created_at + score */}
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

        {/* Image */}
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

        {/* Reflection + footer */}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
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
          onPress={onBack}
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
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: Colors[theme].text,
          }}
        >
          Spots Logged
        </Text>
      </View>

      {/* Search + Sort */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
          zIndex: 10,
        }}
      >
        {/* Search */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#181b1f',
            borderRadius: 999,
            paddingHorizontal: 12,
          }}
        >
          <Feather name="search" size={16} color={Colors[theme].icon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search spots..."
            placeholderTextColor={Colors[theme].icon}
            style={{
              flex: 1,
              color: Colors[theme].text,
              paddingVertical: 8,
              marginLeft: 6,
            }}
          />
        </View>

        {/* Sort dropdown */}
        <View style={{ position: 'relative', zIndex: 20 }}>
          <Pressable
            onPress={() => setSortMenuOpen((open) => !open)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: '#181b1f',
            }}
          >
            <Text
              style={{
                color: Colors[theme].text,
                fontSize: 12,
                marginRight: 4,
              }}
            >
              {sortMode === 'recent' ? 'Recent' : 'A–Z'}
            </Text>
            <Feather
              name={sortMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors[theme].icon}
            />
          </Pressable>

          {sortMenuOpen && (
            <View
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                minWidth: 120,
                borderRadius: 12,
                backgroundColor: '#181b1f',
                borderWidth: 1,
                borderColor: '#26292e',
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 30,
              }}
            >
              <Pressable
                onPress={() => {
                  setSortMode('recent');
                  setSortMenuOpen(false);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors[theme].text,
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  Recent
                </Text>
                {sortMode === 'recent' && (
                  <Feather name="check" size={14} color="#26cb96" />
                )}
              </Pressable>

              <View
                style={{
                  height: 1,
                  backgroundColor: '#26292e',
                  marginHorizontal: 8,
                }}
              />

              <Pressable
                onPress={() => {
                  setSortMode('alpha');
                  setSortMenuOpen(false);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors[theme].text,
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  A–Z
                </Text>
                {sortMode === 'alpha' && (
                  <Feather name="check" size={14} color="#26cb96" />
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors[theme].tint} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
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
              <Text
                style={{
                  marginTop: 4,
                  color: Colors[theme].icon,
                  fontSize: 13,
                }}
              >
                Log a spot from your Home feed to see it here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
