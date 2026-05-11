import React from 'react';
import { Stack } from 'expo-router';
import AdminScreen from '../screens/AdminScreen';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        component={AdminScreen}
        options={{
          title: 'Admin Panel',
        }}
      />
    </Stack>
  );
}
