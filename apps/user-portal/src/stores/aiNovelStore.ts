import { create } from 'zustand';
import type { NovelOutline, GeneratedChapter, NovelDraft } from '@/services/aiNovelService';

export type GenerationPhase = 'idle' | 'outlining' | 'generating' | 'preview' | 'saving' | 'completed' | 'error';

interface AIGenerationState {
  // 生成阶段
  phase: GenerationPhase;
  // 总进度 (0-100)
  progress: number;
  // 当前生成章节
  currentChapter: number;
  // 总章节数
  totalChapters: number;
  // 小说大纲
  outline: NovelOutline | null;
  // 已生成章节
  chapters: GeneratedChapter[];
  // 错误信息
  error: string | null;
  // 是否正在生成
  isGenerating: boolean;
  // 当前草稿
  currentDraft: NovelDraft | null;
  // 设置
  setPhase: (phase: GenerationPhase) => void;
  setProgress: (progress: number) => void;
  setCurrentChapter: (chapter: number) => void;
  setTotalChapters: (total: number) => void;
  setOutline: (outline: NovelOutline | null) => void;
  addChapter: (chapter: GeneratedChapter) => void;
  updateChapterContent: (chapterNumber: number, content: string) => void;
  setError: (error: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentDraft: (draft: NovelDraft | null) => void;
  // 重置状态
  reset: () => void;
  // 开始生成
  startGeneration: (totalChapters: number) => void;
  // 完成生成
  completeGeneration: () => void;
}

const initialState = {
  phase: 'idle' as GenerationPhase,
  progress: 0,
  currentChapter: 0,
  totalChapters: 0,
  outline: null as NovelOutline | null,
  chapters: [] as GeneratedChapter[],
  error: null as string | null,
  isGenerating: false,
  currentDraft: null as NovelDraft | null,
};

export const useAIGenerationStore = create<AIGenerationState>()((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setCurrentChapter: (currentChapter) => set({ currentChapter }),
  setTotalChapters: (totalChapters) => set({ totalChapters }),
  setOutline: (outline) => set({ outline }),
  addChapter: (chapter) =>
    set((state) => ({
      chapters: [...state.chapters, chapter],
    })),
  updateChapterContent: (chapterNumber, content) =>
    set((state) => ({
      chapters: state.chapters.map((c) =>
        c.chapterNumber === chapterNumber ? { ...c, content } : c
      ),
    })),
  setError: (error) => set({ error }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentDraft: (currentDraft) => set({ currentDraft }),

  reset: () => set({ ...initialState }),

  startGeneration: (totalChapters) =>
    set({
      phase: 'outlining',
      progress: 0,
      currentChapter: 0,
      totalChapters,
      outline: null,
      chapters: [],
      error: null,
      isGenerating: true,
      currentDraft: null,
    }),

  completeGeneration: () => {
    const state = get();
    const draft: NovelDraft = {
      id: `draft_${Date.now()}`,
      title: state.outline?.title || '未命名小说',
      description: state.outline?.description || '',
      genre: '',
      hook: state.outline?.hook || '',
      chapters: state.chapters,
      outline: state.outline,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({
      phase: 'preview',
      progress: 100,
      isGenerating: false,
      currentDraft: draft,
    });
  },
}));
