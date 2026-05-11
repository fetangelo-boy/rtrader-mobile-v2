import React from 'react';
import { Stack } from 'expo-router';
import ChatDetailScreen from '../screens/ChatDetailScreen';

export default function ChatLayout() {
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
        name="[id]"
        component={ChatDetailScreen}
        options={{
          title: 'Chat',
        }}
      />
    </Stack>
  );
}
