import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from './store/auth';
import { socketService } from './services/socket';

export default function RootLayout() {
  const router = useRouter();
  const { isLoading, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      await checkAuth();
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        socketService.connect();
        router.replace('/(tabs)');
      } else {
        socketService.disconnect();
        router.replace('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return null;
}
