import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@asg/shared';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
}

let apiInstance: AxiosInstance | null = null;
let config: ApiClientConfig | null = null;

export const initApiClient = (cfg: ApiClientConfig): AxiosInstance => {
  config = cfg;
  apiInstance = axios.create({
    baseURL: cfg.baseURL,
    timeout: cfg.timeout ?? 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  apiInstance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = config?.getAccessToken?.();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  apiInstance.interceptors.response.use(
    (res: AxiosResponse<ApiResponse>) => res,
    (error) => {
      if (error.response?.status === 401) {
        config?.onUnauthorized?.();
      }
      const apiError: ApiError = error.response?.data ?? { code: 500, message: 'Network error', timestamp: Date.now() };
      return Promise.reject(apiError);
    },
  );

  return apiInstance;
};

export const getApiClient = (): AxiosInstance => {
  if (!apiInstance) throw new Error('API client not initialized. Call initApiClient first.');
  return apiInstance;
};
