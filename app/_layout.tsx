import { AuthProvider } from '@/contexts/authContext';
import { RTLProvider } from '@/contexts/RTLContext';
import { useLoadFonts } from '@/hooks/fonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(home)" />
    </Stack>
  );
};

// This is the root layout file
export default function RootLayout() {
  const fontsLoaded = useLoadFonts();

  if (!fontsLoaded) {
    return null; // Return null while fonts are loading
  }

  return (
    <SafeAreaProvider>
      <RTLProvider>
        <AuthProvider>
          <StackLayout />
        </AuthProvider>
      </RTLProvider>
    </SafeAreaProvider>
  );
}