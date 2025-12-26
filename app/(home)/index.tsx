import { useOnboarding } from '@/contexts/onboardingContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ResidentDashboard from '../ui/dashboard/dashboard-resident';
import SyndicDashboard from '../ui/dashboard/dashboard-syndic';

export default function HomeScreen() {
  const { role, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading && !role) {
      // If no role, redirect to onboarding
      router.replace('/(onboarding)/choose-role');
    }
  }, [role, isLoading]);

  // Render based on role
  if (role === 'syndic' || role === 'syndic_resident') {
    return <SyndicDashboard />;
  }

  if (role === 'resident') {
    return <ResidentDashboard />;
  }

  // Loading or no role
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
