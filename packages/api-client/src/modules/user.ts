import { getApiClient } from '../client';
import type { ApiResponse, AuthTokens, LoginRequest, RegisterRequest, User, UserProfile } from '@asg/shared';
import { API_ENDPOINTS } from '@asg/shared';

export const userApi = {
  register: (data: RegisterRequest) =>
    getApiClient().post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.REGISTER, data),

  login: (data: LoginRequest) =>
    getApiClient().post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.LOGIN, data),

  refresh: (refreshToken: string) =>
    getApiClient().post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  me: () =>
    getApiClient().get<ApiResponse<UserProfile>>(API_ENDPOINTS.AUTH.ME),

  updateProfile: (data: Partial<User>) =>
    getApiClient().patch<ApiResponse<User>>('/api/v1/users/profile', data),

  logout: () =>
    getApiClient().post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT),
};
