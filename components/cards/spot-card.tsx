// components/cards/spot-card.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Heart, MessageCircle, Bookmark } from 'lucide-react-native';

type SpotCardUser = {
  name: string;
  handle: string;
  avatar: { uri: string } | null;
};

type SpotCardSpot = {
  name: string;
  location: string;
  image: { uri: string } | null;
  aiScore: number;
  tags: string[];
};

export type SpotCardProps = {
  user: SpotCardUser;
  spot: SpotCardSpot;
  review: string;
  photos: number;
  timestamp: string;
};

export function SpotCard({ user, spot, review, photos, timestamp }: SpotCardProps) {
  return (
    <View style={styles.card}>
      {/* User header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          {user.avatar ? (
            <Image source={user.avatar} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {user.name?.charAt(0) ?? 'N'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        <Bookmark size={18} color="#9ca3af" />
      </View>

      {/* Spot image + score */}
      {spot.image && (
        <View style={styles.spotImageWrapper}>
          <Image source={spot.image} style={styles.spotImage} />
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{spot.aiScore.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}>AI</Text>
          </View>
        </View>
      )}

      {/* Spot info */}
      <View style={styles.body}>
        <View style={styles.spotHeader}>
          <View>
            <Text style={styles.spotName}>{spot.name}</Text>
            <Text style={styles.spotLocation}>{spot.location}</Text>
          </View>
        </View>

        {/* Tags */}
        {spot.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {spot.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Review */}
        {review?.length > 0 && (
          <Text style={styles.reviewText}>{review}</Text>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={18} color="#9ca3af" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={18} color="#9ca3af" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          {photos > 0 && (
            <Text style={styles.photosText}>{photos} photos</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default SpotCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarWrapper: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  spotImageWrapper: {
    position: 'relative',
  },
  spotImage: {
    width: '100%',
    height: 200,
  },
  scoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 4,
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 10,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotName: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  spotLocation: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 6,
  },
  tagChip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  reviewText: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1f2937',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: '#9ca3af',
    fontSize: 13,
    marginLeft: 4,
  },
  photosText: {
    marginLeft: 'auto',
    color: '#9ca3af',
    fontSize: 12,
  },
});
