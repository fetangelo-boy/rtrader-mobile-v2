import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', { refreshToken });
              const { accessToken } = response.data;

              await SecureStore.setItemAsync('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Logout user
            const authStore = useAuthStore.getState();
            await authStore.logout();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async sendOTP(phone: string) {
    const response = await this.client.post('/auth/send-otp', { phone });
    return response.data;
  }

  async verifyOTP(phone: string, code: string) {
    const response = await this.client.post('/auth/verify-otp', { phone, code });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Chats
  async getChats() {
    const response = await this.client.get('/chats');
    return response.data;
  }

  async getMessages(chatId: number, limit = 50, offset = 0) {
    const response = await this.client.get(`/chats/${chatId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // Subscriptions
  async getSubscriptionPlans() {
    const response = await this.client.get('/subscriptions/plans');
    return response.data;
  }

  async getMySubscription() {
    const response = await this.client.get('/subscriptions/my-subscription');
    return response.data;
  }

  async uploadPaymentScreenshot(planId: number, screenshotUrl: string) {
    const response = await this.client.post('/subscriptions/upload-payment', {
      planId,
      screenshotUrl,
    });
    return response.data;
  }

  // Admin
  async getPendingPayments() {
    const response = await this.client.get('/admin/pending-payments');
    return response.data;
  }

  async verifyPayment(subscriptionId: number) {
    const response = await this.client.post(`/admin/verify-payment/${subscriptionId}`);
    return response.data;
  }

  async rejectPayment(subscriptionId: number) {
    const response = await this.client.post(`/admin/reject-payment/${subscriptionId}`);
    return response.data;
  }

  async getStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }
}

export const api = new APIClient();
