import CustomTabBar from '@/components/CustomTabBar';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';

export default function HomeLayout() {
  const { user } = useAuth();
  const { onboardingCompleted, role, isLoading } = useOnboarding();

  // Redirect to onboarding if not completed (only if user is authenticated)
  useEffect(() => {
    // Only redirect to onboarding if user is authenticated
    // If user is null, let index.tsx handle navigation to login
    if (user && !isLoading && !onboardingCompleted) {
      router.replace('/(onboarding)/choose-role');
    }
    // If user is null, redirect to login (let index.tsx handle it, but ensure we don't stay here)
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, onboardingCompleted, isLoading]);

  // Don't render tabs if user is not authenticated or onboarding is not completed
  if (!user || isLoading || !onboardingCompleted) {
    return null;
  }

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen 
        name="payments" 
        options={{
          title: 'Payments',
          tabBarLabel: 'Payments',
        }}
      />
      <Tabs.Screen 
        name="add-action" 
        options={{
          title: 'Add',
          tabBarLabel: '',
          tabBarButton: () => null, // Hide from default tab bar
        }}
      />
      <Tabs.Screen 
        name="apartments" 
        options={{
          title: 'Apartment',
          tabBarLabel: 'Apartment',
        }}
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}
 