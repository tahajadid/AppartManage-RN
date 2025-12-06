import { AuthProvider } from '@/contexts/authContext';
import { RTLProvider } from '@/contexts/RTLContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const StackLayout= () =>{
    return(
      <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(home)" />
      </Stack>
 
)
}

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

// This is the root layout file
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Rubik': require('../assets/font/Rubik.ttf'),
    'NotoKufiArabic': require('../assets/font/NotoKufiArabic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
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