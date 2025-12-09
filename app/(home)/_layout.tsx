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
    <Tabs screenOptions={{ headerShown: false }}>
      {role === 'syndic' ? (
        <>
          <Tabs.Screen 
            name="index" 
            options={{
              title: 'Dashboard',
              tabBarLabel: 'Dashboard',
            }}
          />
          <Tabs.Screen 
            name="residents" 
            options={{
              title: 'Residents',
              tabBarLabel: 'Residents',
            }}
          />
          <Tabs.Screen 
            name="apartments" 
            options={{
              title: 'Apartments',
              tabBarLabel: 'Apartments',
            }}
          />
          <Tabs.Screen 
            name="settings" 
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings',
            }}
          />
        </>
      ) : (
        <>
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
            name="notifications" 
            options={{
              title: 'Notifications',
              tabBarLabel: 'Notifications',
            }}
          />
          <Tabs.Screen 
            name="profile" 
            options={{
              title: 'Profile',
              tabBarLabel: 'Profile',
            }}
          />
        </>
      )}
    </Tabs>
  );
}
 