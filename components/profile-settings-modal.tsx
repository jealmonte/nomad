// components/profile-settings-modal.tsx
import { Feather } from '@expo/vector-icons';
import { decode } from 'base-64';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProfileRow } from '@/app/(tabs)/profile';
import { supabase } from '@/lib/supabase';

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: ProfileRow;
  onProfileUpdated: (profile: ProfileRow) => void;
};

export function ProfileSettingsModal({ visible, onClose, profile, onProfileUpdated }: Props) {
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow Nomad to access your photos for your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5, // Lower quality for smaller file size
      allowsEditing: true,
      aspect: [1, 1], // Square crop for avatars
    });

    if (result.canceled || !result.assets || !result.assets[0]?.uri) return;

    setAvatarLocalUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !username) {
      Alert.alert('Missing info', 'First name, last name, and username are required.');
      return;
    }

    setSaving(true);
    try {
      // 1) enforce unique username (ignore our own row)
      const { data: existing, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', profile.id)
        .maybeSingle();

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw usernameError;
      }
      if (existing) {
        Alert.alert('Username taken', 'Please choose a different username.');
        setSaving(false);
        return;
      }

      let avatarPath = profile.avatar_url;

      // 2) upload new avatar if changed
      if (avatarLocalUri) {
        const fileExt = avatarLocalUri.split('.').pop() || 'jpg';
        const fileName = `${profile.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        console.log('Uploading to path:', filePath);
        console.log('Local URI:', avatarLocalUri);
        
        // Read file as base64 using expo-file-system
        const base64 = await FileSystem.readAsStringAsync(avatarLocalUri, {
          encoding: 'base64',
        });
        
        console.log('Base64 length:', base64.length);
        
        // Convert base64 to ArrayBuffer
        const binaryString = decode(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('Bytes length:', bytes.length);

        const contentType = fileExt.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, bytes, {
            contentType,
            upsert: true,
          });

        console.log('Upload result:', uploadData);
        console.log('Upload error:', uploadError);

        if (uploadError) throw uploadError;
        avatarPath = filePath;
      }

      // 3) update profile row
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          avatar_url: avatarPath,
        })
        .eq('id', profile.id)
        .select('*')
        .maybeSingle<ProfileRow>();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to load updated profile.');
      }

      // Clear local URI after successful save
      setAvatarLocalUri(null);
      
      onProfileUpdated(data);
      onClose();
    } catch (e: any) {
        console.log('Profile update full error:', e);  // <‑‑ add this
        Alert.alert('Update error', e.message);
      } finally {
        setSaving(false);
      }
  };

  // Build avatar URL with proper priority
  const getDisplayAvatar = () => {
    if (avatarLocalUri) return avatarLocalUri;
    if (profile.avatar_url) {
      // If it's already a full URL, use it; otherwise construct Supabase URL
      if (profile.avatar_url.startsWith('http')) return profile.avatar_url;
      
      const { data } = supabase.storage.from('images').getPublicUrl(profile.avatar_url);
      return data?.publicUrl ?? null;
    }
    return null;
  };

  const displayAvatar = getDisplayAvatar();

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      {/* Safe area wrapper so header is below notch / status bar */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Feather name="x" size={20} color="#f8f8f8" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Avatar */}
            <View className="items-center mb-6">
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={40} color="#9ca3af" />
                </View>
              )}
              <TouchableOpacity style={styles.avatarButton} onPress={pickAvatar}>
                <Text style={styles.avatarButtonText}>
                  {displayAvatar ? 'Change photo' : 'Add photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Username"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about your travel style"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070b',
  },
  container: {
    flex: 1,
    backgroundColor: '#05070b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // extra top padding to keep buttons comfortably below notches/status bar
    paddingTop: 64,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2933',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#26cb96',
  },
  saveText: {
    color: '#05070b',
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#26cb96',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  avatarButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26cb96',
  },
  avatarButtonText: {
    color: '#26cb96',
    fontWeight: '500',
    fontSize: 13,
  },
  label: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8f8f8',
    marginBottom: 12,
  },
  bioInput: {
    height: 90,
    textAlignVertical: 'top',
  },
});
