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
    </Stack>
  );
}
