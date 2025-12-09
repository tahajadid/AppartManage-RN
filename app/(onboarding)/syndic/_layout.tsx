import { Stack } from 'expo-router';
import React from 'react';

/**
 * Syndic onboarding layout
 */
export default function SyndicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="syndic-apartment-setup" />
      <Stack.Screen name="syndic-list-resident-setup" />
      <Stack.Screen name="syndic-list-resident-setup-success" />
    </Stack>
  );
}

