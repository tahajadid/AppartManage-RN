import { Stack } from 'expo-router';
import React from 'react';

/**
 * Onboarding layout - Tab bar is hidden during onboarding
 * This is a Stack navigator, not Tabs, so tabs won't show
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choose-role" />
      <Stack.Screen name="syndic-setup" />
      <Stack.Screen name="resident-setup" />
    </Stack>
  );
}

