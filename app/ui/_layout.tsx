import { Stack } from 'expo-router';
import React from 'react';

export default function UILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="addAction/add-action-syndic" />
      <Stack.Screen name="addAction/add-action-resident" />
      <Stack.Screen name="dashboard/syndic-dashboard" />
      <Stack.Screen name="dashboard/resident-dashboard" />
      <Stack.Screen name="settings/edit-profile" options={{animation: 'none'}}  />
      <Stack.Screen name="settings/change-password" options={{animation: 'none'}} />
      <Stack.Screen name="apartment/syndic/modify-resident" />
      <Stack.Screen name="apartment/syndic/modify-apartment" />
      <Stack.Screen name="apartment/syndic/add-resident" />
      <Stack.Screen name="apartment/syndic/apartment-list-syndic" />
      <Stack.Screen name="apartment/residents/apartment-list-resident" />
      <Stack.Screen name="addAction/expenses/add-expense" />
      <Stack.Screen name="payments/syndic/payments-syndic" options={{animation: 'none'}}/>
      <Stack.Screen name="payments/syndic/bills/payments-bills" options={{animation: 'none'}}/>
      <Stack.Screen name="payments/syndic/expenses/payments-expenses-list" options={{animation: 'none'}}/>
      <Stack.Screen name="payments/syndic/expenses/expense-details" options={{animation: 'none'}}/>
      <Stack.Screen name="payments/syndic/expenses/expense-edit" options={{animation: 'none'}}/>
      <Stack.Screen name="payments/resident/payments-resident" options={{animation: 'none'}}/>
    </Stack>
  );
}
