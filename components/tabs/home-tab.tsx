import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';

export function HomeTab() {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.username}>Lawrence</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          {/* Placeholder for Profile Icon */}
          <View style={styles.avatarPlaceholder} />
        </TouchableOpacity>
      </View>

      {/* Search Bar Placeholder */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>Where to next?</Text>
      </View>

      {/* Featured Section */}
      <Text style={styles.sectionTitle}>Featured Trips</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <View style={styles.card}>
          <View style={styles.cardImagePlaceholder} />
          <Text style={styles.cardTitle}>Bali, Indonesia</Text>
          <Text style={styles.cardSubtitle}>5 days • Relaxing</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardImagePlaceholder} />
          <Text style={styles.cardTitle}>Tokyo, Japan</Text>
          <Text style={styles.cardSubtitle}>7 days • City</Text>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Extra padding for top status bar
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  profileButton: {
    padding: 5,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  searchContainer: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 20,
  },
  searchText: {
    color: '#999',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  card: {
    width: 200,
    marginRight: 15,
  },
  cardImagePlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: '#eee',
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});