// components/tabs/home-tab.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Plus, Sparkles, Plane } from 'lucide-react-native';

import { SpotCard } from '@/components/cards/spot-card';
import { LogSpotSheet } from '@/components/sheets/log-spot-sheet';
import { supabase } from '../../lib/supabase';

type FeedPost = {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: { uri: string } | null;
  };
  spot: {
    name: string;
    location: string;
    image: { uri: string } | null;
    aiScore: number;
    tags: string[];
  };
  review: string;
  photos: number;
  timestamp: string;
};

export function HomeTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogSpot, setShowLogSpot] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          auto_score,
          reflection,
          photos_count,
          created_at,
          user:user_id (
            name,
            handle,
            avatar_url
          ),
          spot:spot_id (
            name,
            city,
            country,
            category,
            image_url
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.log('Error fetching feed:', error);
        setLoading(false);
        return;
      }

      const mapped: FeedPost[] = data.map((row: any) => {
        const avatarPath: string | null = row.user?.avatar_url ?? null;
        const spotImagePath: string | null = row.spot?.image_url ?? null;
      
        return {
          id: row.id,
          user: {
            name: row.user?.name ?? 'Traveler',
            handle: row.user?.handle ?? '@nomad',
            avatar: avatarPath ? { uri: avatarPath } : null,
          },
          spot: {
            name: row.spot?.name ?? 'Unknown spot',
            location: row.spot
              ? `${row.spot.city ?? ''}${
                  row.spot.country ? `, ${row.spot.country}` : ''
                }`
              : '',
            image: spotImagePath ? { uri: spotImagePath } : null,
            aiScore: row.auto_score ?? 0,
            tags: row.spot?.category ? [row.spot.category] : [],
          },
          review: row.reflection ?? '',
          photos: row.photos_count ?? 0,
          timestamp: row.created_at
            ? new Date(row.created_at).toLocaleString()
            : '',
        };
      });

      setPosts(mapped);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nomad</Text>
          <Text style={styles.subtitle}>Your travel feed</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              // hook into "Get Lucky" if you want it from Home as well
            }}
            style={styles.iconButton}
          >
            <Sparkles size={20} color="#34D399" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => setShowLogSpot(true)}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Plus size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Log a Spot</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondary]}>
            <Sparkles
              size={20}
              color="#111827"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryText}>Get Lucky</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallIconButton, styles.secondary]}
          >
            <Plane size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Feed */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.feedContainer}>
            {posts.map((item) => (
              <SpotCard key={item.id} {...item} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Log a spot sheet / modal */}
      <LogSpotSheet open={showLogSpot} onOpenChange={setShowLogSpot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2937',
    backgroundColor: 'rgba(2,6,23,0.95)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  headerActions: {
    position: 'absolute',
    right: 16,
    top: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  scroll: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#111827',
  },
  secondaryText: {
    color: '#f9fafb',
    fontWeight: '500',
  },
  smallIconButton: {
    width: 48,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
});
