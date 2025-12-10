import { Stack } from 'expo-router';
import React from 'react';

/**
 * Resident onboarding layout
 */
export default function ResidentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="resident-apartment-setup" />
      <Stack.Screen name="resident-link-user-setup" />
      <Stack.Screen name="resident-success-setup" />
    </Stack>
  );
}