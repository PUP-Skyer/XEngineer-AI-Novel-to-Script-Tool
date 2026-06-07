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

  /** 添加小说（手动创建） */
  async create(params: { title: string; description?: string; genre?: string; tags?: string[]; hook?: string; chapter1Title?: string; chapter1Content?: string }): Promise<any> {
    const { data } = await apiClient.post('/novels', params);
    return data;
  },

  /** 导入小说（PDF/Word） */
  async importFile(
    file: File,
    metadata?: {
      title?: string;
      description?: string;
      genre?: string;
      hook?: string;
    }
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.genre) formData.append('genre', metadata.genre);
    if (metadata?.hook) formData.append('hook', metadata.hook);
    const { data } = await apiClient.post('/novels/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** 获取章节列表 */
  async getChapters(novelId: number): Promise<{ data: any[]; total: number }> {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters`);
    return data;
  },

  /** 获取单章内容 */
  async getChapter(novelId: number, chapterNumber: number): Promise<any> {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters/${chapterNumber}`);
    return data;
  },

  /** 添加章节（续写） */
  async addChapter(novelId: number, title: string, content: string): Promise<any> {
    const { data } = await apiClient.post(`/novels/${novelId}/chapters`, { title, content });
    return data;
  },

  /** 更新小说 */
  async update(id: number, params: { title?: string; description?: string; genre?: string; hook?: string; tags?: string[] }): Promise<NovelListItem> {
    const { data } = await apiClient.put(`/novels/${id}`, params);
    return data;
  },

  /** 删除小说 */
  async delete(id: number): Promise<{ message: string; id: number }> {
    const { data } = await apiClient.delete(`/novels/${id}`);
    return data;
  },

  /** 存档/取消存档小说 */
  async toggleArchive(id: number): Promise<{ id: number; archived: boolean; message: string }> {
    const { data } = await apiClient.patch(`/novels/${id}/archive`);
    return data;
  },

  /** 获取已存档小说列表（排行榜用） */
  async getArchived(query: { page?: number; pageSize?: number; sort?: string } = {}): Promise<PaginatedResponse<NovelListItem>> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    if (query.sort) params.set('sort', query.sort);
    const { data } = await apiClient.get(`/novels/archived?${params.toString()}`);
    return data;
  },
};
