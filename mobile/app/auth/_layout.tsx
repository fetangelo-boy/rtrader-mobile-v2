import React from 'react';
import { Stack } from 'expo-router';
import LoginScreen from '../screens/LoginScreen';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          animationEnabled: false,
        }}
      />
    </Stack>
  );
}
