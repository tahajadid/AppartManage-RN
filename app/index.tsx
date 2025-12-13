import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Root index screen - handles initial navigation based on auth and onboarding status
 */
export default function IndexScreen() {
  const { user, isReady } = useAuth();
  const { onboardingCompleted, isLoading } = useOnboarding();
  const { isChangingLanguage } = useRTL();
  const segments = useSegments();
  const hasNavigatedRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

  // Check Firebase auth directly to avoid context reset issues during remounts
  useEffect(() => {
    setFirebaseUser(auth.currentUser);
  }, []);

  useEffect(() => {
    // Check if we're already on a valid route FIRST (before checking auth)
    // This is the key fix: prevent any navigation if we're already on a valid route
    const currentRoute = segments[0];
    const isOnAuthRoute = currentRoute === '(auth)';
    const isOnOnboardingRoute = currentRoute === '(onboarding)';
    const isOnHomeRoute = currentRoute === '(home)';
    const isOnUIRoute = currentRoute === 'ui';
    
    // CRITICAL FIX: If we're on a valid authenticated route, check Firebase auth directly
    // If Firebase has a user, don't navigate - stay on current route
    // This prevents redirects during remounts (e.g., language changes)
    if (currentRoute && (isOnHomeRoute || isOnOnboardingRoute || isOnUIRoute)) {
      const currentFirebaseUser = auth.currentUser;
      if (currentFirebaseUser) {
        // User is logged in and on a valid route - don't navigate
        hasNavigatedRef.current = true;
        return; // Exit early - stay on current route
      }
    }
    
    // If we're on auth route, stay there (no need to check user)
    if (isOnAuthRoute) {
      hasNavigatedRef.current = true;
      return;
    }

    // Wait for auth to be ready before making navigation decisions
    // This prevents redirects during app remounts (e.g., language changes)
    if (!isReady) {
      return;
    }

    // Use Firebase auth directly as fallback if context user is null but Firebase has a user
    // This handles the case where context resets during remount but Firebase still has auth
    const actualUser = user || firebaseUser;
    
    // If we're on auth route and user is not authenticated, stay there
    if (!actualUser && isOnAuthRoute) {
      hasNavigatedRef.current = true;
      return;
    }

    // On remounts (like language changes), if we've already navigated and user exists, don't redirect
    // This prevents navigation loops during remounts
    if (!isInitialMountRef.current && hasNavigatedRef.current && actualUser) {
      return;
    }

    // Mark that we're past initial mount after first navigation decision
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }

    // Always prioritize auth state - if user is not authenticated, navigate to login immediately
    // This check must happen first, before any onboarding checks
    if (!actualUser) {
      // Not authenticated - go to login immediately
      // Don't wait for onboarding status, just navigate to login
      if (!isOnAuthRoute) {
        router.replace('/(auth)/login');
        hasNavigatedRef.current = true;
      }
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
      if (!isOnOnboardingRoute) {
        router.replace('/(onboarding)/choose-role');
        hasNavigatedRef.current = true;
      }
    } else {
      // Authenticated and onboarding completed - go to home
      if (!isOnHomeRoute && !isOnUIRoute) {
        router.replace('/(home)');
        hasNavigatedRef.current = true;
      }
    }
  }, [user, firebaseUser, onboardingCompleted, isLoading, isReady, segments, isChangingLanguage]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
