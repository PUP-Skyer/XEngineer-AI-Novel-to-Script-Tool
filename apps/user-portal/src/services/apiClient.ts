import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = '/api';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach auth token
  client.interceptors.request.use(
    (config) => {
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();
export default apiClient;
