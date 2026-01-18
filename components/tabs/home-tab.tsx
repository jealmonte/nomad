// components/tabs/home-tab.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus, Sparkles, Plane } from 'lucide-react-native';

import { SpotCard } from '../cards/spot-card';
import { LogSpotSheet } from '../sheets/log-spot-sheet'; // your RN version

const feedData = [
  {
    id: 1,
    user: {
      name: 'Sarah Chen',
      avatar: require('../../public/diverse-woman-avatar.png'),
      handle: '@sarahc',
    },
    spot: {
      name: 'Senso-ji Temple',
      location: 'Tokyo, Japan',
      image: require('../../public/senso-ji-temple-tokyo.jpg'),
      aiScore: 9.2,
      tags: ['temples', 'culture', 'must-see'],
    },
    review:
      "Absolutely magical at sunrise. The crowds are minimal and the light is perfect for photos. Don't skip the nearby street food!",
    photos: 3,
    timestamp: '2h ago',
  },
  {
    id: 2,
    user: {
      name: 'Marco Rivera',
      avatar: require('../../public/man-avatar-beard.png'),
      handle: '@marco_travels',
    },
    spot: {
      name: 'Café de Flore',
      location: 'Paris, France',
      image: require('../../public/cafe-de-flore-paris.jpg'),
      aiScore: 8.7,
      tags: ['coffee', 'iconic', 'breakfast'],
    },
    review:
      'Classic Parisian vibes. The hot chocolate is legendary but pricey. Perfect for people watching.',
    photos: 2,
    timestamp: '5h ago',
  },
  {
    id: 3,
    user: {
      name: 'Emma Wilson',
      avatar: require('../../public/woman-blonde-avatar.jpg'),
      handle: '@emma.w',
    },
    spot: {
      name: 'Fushimi Inari Shrine',
      location: 'Kyoto, Japan',
      image: require('../../public/fushimi-inari-shrine-gates.jpg'),
      aiScore: 9.5,
      tags: ['temples', 'hiking', 'photography'],
    },
    review:
      'The hike through thousands of torii gates is surreal. Go early morning to beat the crowds - totally worth the early wake up!',
    photos: 5,
    timestamp: '1d ago',
  },
];

export function HomeTab() {
  const [showLogSpot, setShowLogSpot] = useState(false);

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
              /* hook into Get Lucky later */
            }}
            style={styles.iconButton}
          >
            <Sparkles size={20} color="#34D399" />
          </TouchableOpacity>
        </View>
      </View>

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
            <Sparkles size={20} color="#111827" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryText}>Get Lucky</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.smallIconButton, styles.secondary]}>
            <Plane size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <View style={styles.feedContainer}>
          {feedData.map((item) => (
            <SpotCard key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>

      {/* Log a spot sheet/modal – implementation is up to your RN version */}
      <LogSpotSheet open={showLogSpot} onOpenChange={setShowLogSpot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // match your dark theme if desired
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
