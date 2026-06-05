import { getApiClient } from '../client';
import type { ApiResponse, PaginatedResponse, Novel, NovelListItem, NovelListQuery, GenerateNovelRequest } from '@asg/shared';
import { API_ENDPOINTS } from '@asg/shared';

export const novelApi = {
  list: (query?: NovelListQuery) =>
    getApiClient().get<PaginatedResponse<NovelListItem>>(API_ENDPOINTS.NOVELS.LIST, { params: query }),

  detail: (id: number) =>
    getApiClient().get<ApiResponse<Novel>>(API_ENDPOINTS.NOVELS.DETAIL(id)),

  generate: (data: GenerateNovelRequest) =>
    getApiClient().post<ApiResponse<{ taskId: string }>>(API_ENDPOINTS.NOVELS.GENERATE, data),

  generateStatus: (taskId: string) =>
    getApiClient().get<ApiResponse<{ status: string; progress: number; novelId?: number }>>(API_ENDPOINTS.NOVELS.GENERATE_STATUS(taskId)),

  update: (id: number, data: Partial<Novel>) =>
    getApiClient().patch<ApiResponse<Novel>>(API_ENDPOINTS.NOVELS.DETAIL(id), data),

  delete: (id: number) =>
    getApiClient().delete<ApiResponse<void>>(API_ENDPOINTS.NOVELS.DETAIL(id)),
};
