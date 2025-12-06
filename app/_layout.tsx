import { AuthProvider } from '@/contexts/authContext';
import { RTLProvider } from '@/contexts/RTLContext';
import { Stack } from 'expo-router';
import React from 'react';
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

// This is the root layout file
export default function RootLayout() {
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