import { getApiClient } from '../client';
import type { ApiResponse, Script } from '@asg/shared';
import { API_ENDPOINTS } from '@asg/shared';

export const scriptApi = {
  convert: (novelId: number) =>
    getApiClient().post<ApiResponse<{ taskId: string }>>(API_ENDPOINTS.SCRIPTS.CONVERT(novelId)),

  detail: (id: number) =>
    getApiClient().get<ApiResponse<Script>>(API_ENDPOINTS.SCRIPTS.DETAIL(id)),

  yaml: (id: number) =>
    getApiClient().get<ApiResponse<{ yamlContent: string }>>(API_ENDPOINTS.SCRIPTS.YAML(id)),

  update: (id: number, data: Partial<Script>) =>
    getApiClient().patch<ApiResponse<Script>>(API_ENDPOINTS.SCRIPTS.DETAIL(id), data),

  validate: (id: number) =>
    getApiClient().patch<ApiResponse<{ valid: boolean; errors?: string[] }>>(API_ENDPOINTS.SCRIPTS.VALIDATE(id)),

  list: (params?: { page?: number; pageSize?: number }) =>
    getApiClient().get(API_ENDPOINTS.SCRIPTS.LIST, { params }),
};
