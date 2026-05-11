import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { JWTPayload } from '../types/index';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  login: (accessToken: string, refreshToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const user = await SecureStore.getItemAsync('user');

      if (token && user) {
        set({
          isLoading: false,
          isAuthenticated: true,
          accessToken: token,
          refreshToken: refreshToken,
          user: JSON.parse(user),
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (accessToken, refreshToken, user) => {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({
        isAuthenticated: true,
        accessToken,
        refreshToken,
        user,
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');

      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        user: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  updateUser: (user) => {
    set({ user });
  },
}));
