import { useOnboarding } from '@/contexts/onboardingContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ApartmentListResident from '../ui/apartment/residents/apartment-list-resident';
import ApartmentListSyndic from '../ui/apartment/syndic/apartment-list-syndic';

export default function ApartmentScreen() {
  const { role, isLoading } = useOnboarding();

  // Render based on role
  if (role === 'syndic' || role === 'syndic_resident') {
    return <ApartmentListSyndic />;
  }

  if (role === 'resident') {
    return <ApartmentListResident />;
  }

  // Loading or no role
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
