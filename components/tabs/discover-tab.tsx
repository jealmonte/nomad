import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Alert
} from 'react-native';
import { Search, SlidersHorizontal, Sparkles, MapPin, X } from 'lucide-react-native';
import { getLucky } from '@/services/woodwide';

// --- Types ---
type Spot = {
  id: number;
  name: string;
  location: string;
  image?: any; 
  aiScore: number;
  distance: string | number;
  tags: string[];
  matchReason?: string;
  compatibilityScore?: number;
};

const recommendations: Spot[] = [
  {
    id: 101,
    name: "Ghibli Museum",
    location: "Mitaka, Tokyo",
    aiScore: 9.6,
    distance: "12.0 km",
    tags: ["museums", "art", "whimsical"],
    matchReason: "Must visit for anime fans",
  },
  {
    id: 102,
    name: "Yoyogi Park",
    location: "Shibuya, Tokyo",
    aiScore: 9.0,
    distance: "5.0 km",
    tags: ["nature", "peaceful", "picnic"],
    matchReason: "Popular local spot",
  },
  {
    id: 103,
    name: "Omoide Yokocho",
    location: "Shinjuku, Tokyo",
    aiScore: 8.5,
    distance: "4.0 km",
    tags: ["nightlife", "food", "crowded"],
    matchReason: "Authentic atmosphere",
  },
];

const tags = ["temples", "nightlife", "coffee", "beaches", "nature", "food", "museums", "markets"];

export function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [luckySpot, setLuckySpot] = useState<Spot | null>(null);

  // --- Handlers ---
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGetLucky = async () => {
    setIsLoading(true);
    setLuckySpot(null);

    try {
      const spot = await getLucky();
      
      const rawScore = (spot.compatibilityScore || 0) * 100;
      // Cap at 99% for realism if it's super high, but allow 100 if you want
      const displayScore = rawScore > 99 ? 99 : rawScore.toFixed(0);
      
      const formattedSpot: Spot = {
        id: spot.id,
        name: spot.name,
        location: spot.location,
        aiScore: spot.aiScore,
        distance: typeof spot.distance === 'number' ? `${spot.distance} km` : spot.distance,
        tags: spot.tags,
        compatibilityScore: spot.compatibilityScore,
        matchReason: `AI Match: ${displayScore}%`,
      };
      
      setLuckySpot(formattedSpot);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to find a recommendation.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* ... Header Code (same as before) ... */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Find a spot..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Get Lucky Button */}
        <TouchableOpacity 
          style={[styles.luckyButton, isLoading && styles.luckyButtonDisabled]} 
          onPress={handleGetLucky}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          ) : (
            <Sparkles size={20} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.luckyButtonText}>
            {isLoading ? 'Training AI Model...' : 'Get Lucky - AI Recommendation'}
          </Text>
        </TouchableOpacity>

        {/* Tags Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tag, isSelected && styles.tagSelected]}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Current Location */}
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#007AFF" />
          <Text style={styles.locationText}>Near Tokyo, Japan</Text>
        </View>

        {/* Recommendations List */}
        <Text style={styles.sectionTitle}>Places to Explore</Text>
        {recommendations.map((spot) => (
          <View key={spot.id} style={styles.card}>
            <View style={styles.cardImagePlaceholder} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{spot.name}</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{spot.aiScore}</Text>
                </View>
              </View>
              
              <Text style={styles.cardLocation}>{spot.location} • {spot.distance}</Text>
              
              {spot.matchReason && (
                <View style={styles.matchBadge}>
                  <Sparkles size={12} color="#7C3AED" />
                  <Text style={styles.matchText}>{spot.matchReason}</Text>
                </View>
              )}

              <View style={styles.cardTags}>
                {spot.tags.map(t => (
                  <Text key={t} style={styles.miniTag}>#{t}</Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Lucky Result Modal */}
      <Modal visible={!!luckySpot} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Lucky Spot!</Text>
              <TouchableOpacity onPress={() => setLuckySpot(null)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Our AI analyzed your history and thinks you will love this:
            </Text>

            {luckySpot && (
              <View style={[styles.card, { width: '100%', marginTop: 20 }]}>
                 <View style={styles.cardImagePlaceholder} />
                 <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{luckySpot.name}</Text>
                    <Text style={styles.cardLocation}>{luckySpot.location}</Text>
                    <View style={[styles.matchBadge, { marginTop: 10 }]}>
                      <Text style={styles.matchText}>{luckySpot.matchReason}</Text>
                    </View>
                    <View style={[styles.cardTags, { marginTop: 10 }]}>
                        {luckySpot.tags.map(t => (
                            <Text key={t} style={styles.miniTag}>#{t}</Text>
                        ))}
                    </View>
                 </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.luckyButton, { marginTop: 20 }]} 
              onPress={() => setLuckySpot(null)}
            >
              <Text style={styles.luckyButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60, // Safe Area padding
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  luckyButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  luckyButtonDisabled: {
    opacity: 0.7,
  },
  luckyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tagSelected: {
    backgroundColor: '#000',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tagTextSelected: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddd',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBadge: {
    backgroundColor: '#f0fdf4', // light green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardLocation: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff', // light purple
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  matchText: {
    color: '#7c3aed',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniTag: {
    color: '#999',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
  },
});