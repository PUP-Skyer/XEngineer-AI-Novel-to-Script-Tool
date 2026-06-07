import { describe, it, expect, vi, beforeEach } from 'vitest';
import { novelService } from './novelService';
import { apiClient } from './apiClient';

// Mock the apiClient
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('NovelService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getList', () => {
    it('should fetch novels with default params', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: 'Test Novel' }],
          total: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await novelService.getList();

      expect(apiClient.get).toHaveBeenCalledWith('/novels?page=1&pageSize=12');
      expect(result.data).toHaveLength(1);
    });

    it('should fetch novels with custom params', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      await novelService.getList({ page: 2, pageSize: 24, genre: 'suspense' });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/novels?page=2&pageSize=24&genre=suspense'
      );
    });
  });

  describe('update', () => {
    it('should update novel with provided fields', async () => {
      const mockNovel = { id: 1, title: 'Updated Title' };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockNovel });

      const result = await novelService.update(1, { title: 'Updated Title' });

      expect(apiClient.put).toHaveBeenCalledWith('/novels/1', {
        title: 'Updated Title',
      });
      expect(result).toEqual(mockNovel);
    });
  });

  describe('delete', () => {
    it('should delete novel by id', async () => {
      const mockResponse = { message: '删除成功', id: 1 };
      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      const result = await novelService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/novels/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('toggleArchive', () => {
    it('should toggle archive status', async () => {
      const mockResponse = { id: 1, archived: true, message: '已存档' };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockResponse });

      const result = await novelService.toggleArchive(1);

      expect(apiClient.patch).toHaveBeenCalledWith('/novels/1/archive');
      expect(result.archived).toBe(true);
    });
  });

  describe('getArchived', () => {
    it('should fetch archived novels sorted by rating', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: 'Archived Novel', archived: true }],
          total: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await novelService.getArchived({
        page: 1,
        pageSize: 20,
        sort: 'rating',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/novels/archived?page=1&pageSize=20&sort=rating'
      );
      expect(result.data[0].archived).toBe(true);
    });
  });
});