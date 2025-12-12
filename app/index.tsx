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
    // Always prioritize auth state - if user is not authenticated, navigate to login immediately
    // This check must happen first, before any onboarding checks
    if (!user) {
      // Not authenticated - go to login immediately
      // Don't wait for onboarding status, just navigate to login
      router.replace('/(auth)/login');
      return;
    }

    // Only check onboarding status if user is authenticated
    // If still loading onboarding status, wait
    if (isLoading) {
      return;
    }

    // User is authenticated - check onboarding status
    if (!onboardingCompleted) {
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
