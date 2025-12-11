import { AuthProvider } from '@/contexts/authContext';
import { OnboardingProvider } from '@/contexts/onboardingContext';
import { RTLProvider } from '@/contexts/RTLContext';
import { useLoadFonts } from '@/hooks/fonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

// Suppress "Unable to activate keep awake" errors (harmless development warnings)
if (__DEV__) {
  LogBox.ignoreLogs([
    'Unable to activate keep awake',
    'Error: Unable to activate keep awake',
  ]);
  
  // Also catch unhandled promise rejections for keep awake errors
  const originalErrorHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (error?.message?.includes('Unable to activate keep awake')) {
      // Silently ignore keep awake errors
      return;
    }
    // Call original handler for other errors
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
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
          <OnboardingProvider>
            <StackLayout />
          </OnboardingProvider>
        </AuthProvider>
      </RTLProvider>
    </SafeAreaProvider>
  );
}