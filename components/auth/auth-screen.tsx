// components/auth/auth-screen.tsx
import { decode } from 'base-64';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // profile fields for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // avatar local preview
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

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

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Sign in error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName || !username) {
      Alert.alert(
        'Missing info',
        'Email, password, username, first name, and last name are required.'
      );
      return;
    }

    setLoading(true);
    try {
      // 1) enforce unique username
      const { data: existing, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw usernameError;
      }
      if (existing) {
        Alert.alert('Username taken', 'Please choose a different username.');
        setLoading(false);
        return;
      }

      // 2) create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const user = signUpData.user;
      if (!user) {
        Alert.alert(
          'Check your email',
          'Account created. Please confirm your email before logging in.'
        );
        setLoading(false);
        return;
      }

      // 3) upload avatar to Supabase Storage (images/avatars/<user-id>.<ext>)
      let uploadedAvatarPath: string | null = null;
      if (avatarLocalUri) {
        const ext = avatarLocalUri.split('.').pop() || 'jpg';
        const fileName = `${user.id}.${ext}`;
        const storagePath = `avatars/${fileName}`;

        console.log('Uploading to path:', storagePath);
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

        const contentType = ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(storagePath, bytes, {
            contentType,
            upsert: true,
          });

        console.log('Upload result:', uploadData);
        console.log('Upload error:', uploadError);

        if (uploadError) throw uploadError;
        uploadedAvatarPath = storagePath;
      }

      // 4) create profile row
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        username,
        bio,
        avatar_url: uploadedAvatarPath,
      });

      if (profileError) throw profileError;
    } catch (e: any) {
      Alert.alert('Sign up error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'signin') {
      if (!email || !password) {
        Alert.alert('Missing info', 'Enter email and password.');
        return;
      }
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nomad</Text>
      <Text style={styles.subtitle}>
        {mode === 'signin'
          ? 'Sign in to your account'
          : 'Create an account and your Nomad profile'}
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {mode === 'signup' && (
        <>
          <TextInput
            placeholder="First name"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            placeholder="Last name"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            placeholder="Username (must be unique)"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            placeholder="Bio"
            placeholderTextColor="#9ca3af"
            multiline
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={bio}
            onChangeText={setBio}
          />

          {/* Avatar picker */}
          <TouchableOpacity style={styles.avatarButton} onPress={pickAvatar}>
            {avatarLocalUri ? (
              <View style={styles.avatarPreviewRow}>
                <Image source={{ uri: avatarLocalUri }} style={styles.avatarPreview} />
                <Text style={styles.avatarButtonText}>Change avatar photo</Text>
              </View>
            ) : (
              <Text style={styles.avatarButtonText}>Choose avatar photo</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#05070b" />
        ) : (
          <Text style={styles.primaryText}>
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.secondaryText}>
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070b',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#f8f8f8', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8f8f8f', marginBottom: 24 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#181b1f',
    color: '#f8f8f8',
    marginBottom: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#26cb96',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#05070b', fontWeight: '600' },
  secondaryButton: { marginTop: 16, alignItems: 'center' },
  secondaryText: { color: '#8f8f8f', fontSize: 13 },
  avatarButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#26cb96',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  avatarButtonText: { color: '#26cb96', fontWeight: '500' },
  avatarPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPreview: { width: 32, height: 32, borderRadius: 16 },
});
