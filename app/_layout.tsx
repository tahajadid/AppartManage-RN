import { AuthProvider } from '@/contexts/authContext';
import { OnboardingProvider } from '@/contexts/onboardingContext';
import { RTLProvider } from '@/contexts/RTLContext';
import { ThemeProvider } from '@/contexts/themeContext';
import { useLoadFonts } from '@/hooks/fonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

// Suppress "Unable to activate keep awake" errors (harmless development warnings)
LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Error: Unable to activate keep awake',
]);

// Catch unhandled promise rejections for keep awake errors
// Note: We can't override Promise.reject directly, so we handle it in the global handler

// Also catch unhandled promise rejections globally
if (typeof global !== 'undefined') {
  const originalUnhandledRejection = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: any) => {
    if (event?.reason?.message && event.reason.message.includes('keep awake')) {
      event.preventDefault();
      return;
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
}

// Also catch unhandled errors
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

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(home)" />
      <Stack.Screen name="ui" />
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
      <StatusBar barStyle="light-content" backgroundColor="#427DBD" translucent={false} />
      <ThemeProvider>
        <RTLProvider>
          <AuthProvider>
            <OnboardingProvider>
              <StackLayout />
            </OnboardingProvider>
          </AuthProvider>
        </RTLProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}