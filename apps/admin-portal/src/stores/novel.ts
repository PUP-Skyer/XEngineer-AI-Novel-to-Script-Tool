import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

export interface Novel {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  wordCount: number;
  chapterCount: number;
  synopsis: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NovelQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  genre?: string;
}

export interface NovelListResponse {
  list: Novel[];
  total: number;
  page: number;
  pageSize: number;
}

export const useNovelStore = defineStore('novel', () => {
  // 列表数据
  const novelList = ref<Novel[]>([]);
  const total = ref(0);
  const loading = ref(false);

  // 查询参数
  const queryParams = reactive<NovelQuery>({
    page: 1,
    pageSize: 20,
    keyword: '',
    status: '',
    genre: '',
  });

  // 详情数据
  const currentNovel = ref<Novel | null>(null);
  const detailLoading = ref(false);

  // 获取小说列表
  async function fetchNovels(): Promise<void> {
    loading.value = true;
    try {
      // TODO: 替换为实际 API 调用
      // const response = await apiClient.novel.list(queryParams);
      // novelList.value = response.data.list;
      // total.value = response.data.total;

      // 模拟数据
      novelList.value = [
        {
          id: '1',
          title: '三体',
          author: '刘慈欣',
          genre: '科幻',
          status: 'approved',
          wordCount: 880000,
          chapterCount: 36,
          synopsis: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝密计划"红岸工程"取得了突破性进展。',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          title: '活着',
          author: '余华',
          genre: '现实',
          status: 'approved',
          wordCount: 120000,
          chapterCount: 12,
          synopsis: '地主少爷福贵嗜赌成性，终于赌光了家业。一贫如洗的他在大时代的变迁中经历了家人的相继离世。',
          createdAt: '2024-02-10T08:00:00Z',
          updatedAt: '2024-02-15T10:30:00Z',
        },
        {
          id: '3',
          title: '天龙八部',
          author: '金庸',
          genre: '武侠',
          status: 'pending',
          wordCount: 1200000,
          chapterCount: 50,
          synopsis: '以宋哲宗时代为背景，通过宋、辽、大理、西夏、吐蕃等王国之间的武林恩怨和民族矛盾。',
          createdAt: '2024-03-05T08:00:00Z',
          updatedAt: '2024-03-05T08:00:00Z',
        },
      ];
      total.value = 3;
    } catch {
      ElMessage.error('获取小说列表失败');
    } finally {
      loading.value = false;
    }
  }

  // 获取小说详情
  async function fetchNovelDetail(id: string): Promise<void> {
    detailLoading.value = true;
    try {
      // TODO: 替换为实际 API 调用
      // const response = await apiClient.novel.detail(id);
      // currentNovel.value = response.data;

      currentNovel.value = novelList.value.find((n) => n.id === id) || null;
    } catch {
      ElMessage.error('获取小说详情失败');
    } finally {
      detailLoading.value = false;
    }
  }

  // 审核小说
  async function reviewNovel(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      // TODO: 替换为实际 API 调用
      // await apiClient.novel.review(id, status);

      const novel = novelList.value.find((n) => n.id === id);
      if (novel) {
        novel.status = status;
      }
      ElMessage.success(status === 'approved' ? '审核通过' : '已驳回');
      return true;
    } catch {
      ElMessage.error('审核操作失败');
      return false;
    }
  }

  // 删除小说
  async function deleteNovel(id: string): Promise<boolean> {
    try {
      // TODO: 替换为实际 API 调用
      // await apiClient.novel.delete(id);

      novelList.value = novelList.value.filter((n) => n.id !== id);
      total.value--;
      ElMessage.success('删除成功');
      return true;
    } catch {
      ElMessage.error('删除失败');
      return false;
    }
  }

  // 重置查询参数
  function resetQuery(): void {
    queryParams.page = 1;
    queryParams.pageSize = 20;
    queryParams.keyword = '';
    queryParams.status = '';
    queryParams.genre = '';
  }

  return {
    novelList,
    total,
    loading,
    queryParams,
    currentNovel,
    detailLoading,
    fetchNovels,
    fetchNovelDetail,
    reviewNovel,
    deleteNovel,
    resetQuery,
  };
});
