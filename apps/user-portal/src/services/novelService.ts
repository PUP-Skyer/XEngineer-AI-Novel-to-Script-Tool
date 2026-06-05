import apiClient from './apiClient';
import type {
  Novel,
  NovelListItem,
  NovelListQuery,
  GenerateNovelRequest,
} from '@asg/shared';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const novelService = {
  /** 获取小说列表 */
  async getList(query: NovelListQuery = {}): Promise<PaginatedResponse<NovelListItem>> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    if (query.genre) params.set('genre', query.genre);
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);

    const { data } = await apiClient.get(`/novels?${params.toString()}`);
    return data;
  },

  /** 获取小说详情 */
  async getById(id: number): Promise<Novel> {
    const { data } = await apiClient.get(`/novels/${id}`);
    return data;
  },

  /** AI 生成小说 */
  async generate(request: GenerateNovelRequest): Promise<Novel> {
    const { data } = await apiClient.post('/novels/generate', request);
    return data;
  },

  /** 获取生成进度 */
  async getGenerationProgress(novelId: number): Promise<{
    status: string;
    progress: number;
    message?: string;
  }> {
    const { data } = await apiClient.get(`/novels/${novelId}/progress`);
    return data;
  },

  /** 收藏/取消收藏小说 */
  async toggleFavorite(novelId: number): Promise<{ favorited: boolean }> {
    const { data } = await apiClient.post(`/novels/${novelId}/favorite`);
    return data;
  },

  /** 评分 */
  async rate(novelId: number, rating: number): Promise<{ avgRating: number }> {
    const { data } = await apiClient.post(`/novels/${novelId}/rate`, { rating });
    return data;
  },
};
