import CustomTabBar from '@/components/CustomTabBar';
import { useOnboarding } from '@/contexts/onboardingContext';
import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';

export default function HomeLayout() {
  const { onboardingCompleted, role, isLoading } = useOnboarding();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isLoading && !onboardingCompleted) {
      router.replace('/(onboarding)/choose-role');
    }
  }, [onboardingCompleted, isLoading]);

  // Don't render tabs until onboarding is confirmed
  if (isLoading || !onboardingCompleted) {
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
 