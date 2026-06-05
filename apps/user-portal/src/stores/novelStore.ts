import { create } from 'zustand';
import type { NovelListItem, NovelListQuery } from '@asg/shared';

interface NovelState {
  novels: NovelListItem[];
  currentNovel: NovelListItem | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  query: NovelListQuery;
  setNovels: (novels: NovelListItem[], total: number) => void;
  setCurrentNovel: (novel: NovelListItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setQuery: (query: Partial<NovelListQuery>) => void;
  resetQuery: () => void;
}

const defaultQuery: NovelListQuery = {
  page: 1,
  pageSize: 12,
  sort: 'latest',
};

export const useNovelStore = create<NovelState>()((set) => ({
  novels: [],
  currentNovel: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 12,
  query: { ...defaultQuery },

  setNovels: (novels, total) => set({ novels, total }),
  setCurrentNovel: (novel) => set({ currentNovel: novel }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) =>
    set((state) => ({
      page,
      query: { ...state.query, page },
    })),
  setQuery: (query) =>
    set((state) => ({
      query: { ...state.query, ...query },
    })),
  resetQuery: () => set({ query: { ...defaultQuery } }),
}));
