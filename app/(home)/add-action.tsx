import { useOnboarding } from '@/contexts/onboardingContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

export default function AddActionScreen() {
  const { role, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading && role) {
      // Route based on user role
      if (role === 'syndic' || role === 'syndic_resident') {
        router.replace('/ui/home/addAction/add-action-syndic' as any);
      } else if (role === 'resident') {
        router.replace('/ui/home/addAction/add-action-resident' as any);
      } else {
        // Fallback: go back if role is unknown
        router.back();
      }
    }
  }, [role, isLoading]);

  return null;
}

