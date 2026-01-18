// app/(tabs)/profile.tsx
import { ProfileSettingsModal } from '@/components/profile-settings-modal';
import { ProfileTab } from '@/components/tabs/profile-tab';
import { SpotsLoggedTab } from '@/components/tabs/spots-logged-tab';
import { getPublicAvatarUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  countries: number | null;
  cities: number | null;
  spots: number | null;
  avgScore: number | null;
  followers: number | null;
  following: number | null;
  top_tags: string[] | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<'profile' | 'spots'>('profile');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout error', error.message);
    }
  };

  const loadProfile = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle<ProfileRow>();

    if (error) {
      Alert.alert('Profile error', error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      Alert.alert('Profile missing', 'No profile found for this account.');
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // While loading or missing profile, show spinner
  if (loading || !profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#05070b',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color="#26cb96" />
      </View>
    );
  }

  // When in "spots" mode, show SpotsLoggedTab
  if (mode === 'spots') {
    return <SpotsLoggedTab onBack={() => setMode('profile')} />;
  }

  const avatarUrl = getPublicAvatarUrl(profile.avatar_url);

  return (
    <>
      <ProfileTab
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSpots={() => setMode('spots')}
        profile={{
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          bio: profile.bio,
          avatar_url: avatarUrl,
          followers: profile.followers ?? 0,
          following: profile.following ?? 0,
          countries: profile.countries ?? 0,
          cities: profile.cities ?? 0,
          spots: profile.spots ?? 0,
          avgScore: profile.avgScore ?? 0,
          topTags: profile.top_tags ?? [],
        }}
      />
      <ProfileSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          loadProfile();
        }}
      />
    </>
  );
}
