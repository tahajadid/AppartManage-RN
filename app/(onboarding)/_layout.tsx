import { useAuth } from '@/contexts/authContext';
import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';

/**
 * Onboarding layout - Tab bar is hidden during onboarding
 * This is a Stack navigator, not Tabs, so tabs won't show
 */
export default function OnboardingLayout() {
  const { user } = useAuth();

  // If user is not authenticated, redirect to login
  // This prevents accessing onboarding screens after sign-out
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  // Don't render onboarding screens if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choose-role" />
      <Stack.Screen name="syndic" />
      <Stack.Screen name="resident" />
    </Stack>
  );
}

