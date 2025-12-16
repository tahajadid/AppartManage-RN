import { useOnboarding } from '@/contexts/onboardingContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PaymentsResident from '../ui/payments/payments-resident';
import PaymentsSyndic from '../ui/payments/payments-syndic';

export default function PaymentsScreen() {
  const { role, isLoading } = useOnboarding();

  // Render based on role
  if (role === 'syndic' || role === 'syndic_resident') {
    return <PaymentsSyndic />;
  }

  if (role === 'resident') {
    return <PaymentsResident />;
  }

  // Loading or no role
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

