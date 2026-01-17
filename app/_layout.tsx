import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

/* if (!loaded && !error) {
  return null;
}
*/

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: '#1a1a2e' },
      headerTintColor: '#fff',
      contentStyle: { backgroundColor: '#fff' }
    }}>
      {/* This defines your main index route */}
      <Stack.Screen name="index" options={{ title: 'Nomad' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});