import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="index" options={{ animationEnabled: false }} />
        <Stack.Screen name="auth" options={{ animationEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animationEnabled: false }} />
        <Stack.Screen name="chat" options={{ animationEnabled: false }} />
        <Stack.Screen name="admin" options={{ animationEnabled: false }} />
      </Stack>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
    </>
  );
}
