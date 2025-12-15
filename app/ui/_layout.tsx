import { Stack } from 'expo-router';
import React from 'react';

export default function UILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="addAction/add-action-syndic" />
      <Stack.Screen name="addAction/add-action-resident" />
      <Stack.Screen name="dashboard/syndic-dashboard" />
      <Stack.Screen name="dashboard/resident-dashboard" />
      <Stack.Screen name="settings/edit-profile" />
      <Stack.Screen name="settings/change-password" />
      <Stack.Screen name="apartment/syndic/modify-resident" />
      <Stack.Screen name="apartment/syndic/modify-apartment" />
      <Stack.Screen name="apartment/syndic/add-resident" />
      <Stack.Screen name="apartment/syndic/apartment-list-syndic" />
      <Stack.Screen name="apartment/residents/apartment-list-resident" />
    </Stack>
  );
}
