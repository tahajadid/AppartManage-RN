import { Stack } from 'expo-router';
import React from 'react';

// This layout is specific to the (auth) group
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{animation: 'none'}} />
      <Stack.Screen name="register" options={{animation: 'none'}} />
      <Stack.Screen name="forget-password" options={{animation: 'none'}} />
    </Stack>
  );
}