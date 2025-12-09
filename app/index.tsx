import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Root index screen - handles initial navigation based on auth and onboarding status
 */
export default function IndexScreen() {
  const { user } = useAuth();
  const { onboardingCompleted, isLoading } = useOnboarding();

  useEffect(() => {
    if (isLoading) return; // Wait for onboarding status to load

    if (!user) {
      // Not authenticated - go to login
      router.replace('/(auth)/login');
    } else if (!onboardingCompleted) {
      // Authenticated but onboarding not completed - go to onboarding
      router.replace('/(onboarding)/choose-role');
    } else {
      // Authenticated and onboarding completed - go to home
      router.replace('/(home)');
    }
  }, [user, onboardingCompleted, isLoading]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
