import { Stack } from 'expo-router';
import React from 'react';

export default function UILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home/addAction/add-action-syndic" />
      <Stack.Screen name="home/addAction/add-action-resident" />
    </Stack>
  );
}
