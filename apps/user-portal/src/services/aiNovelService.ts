import apiClient from './apiClient';

export interface AIGenerationParams {
  prompt: string;
  genre: string;
  wordCount: number;
  chapterCount: number;
  style: string;
  tone: string;
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  emotionalTone: string;
  wordCount: number;
}

export interface NovelOutline {
  title: string;
  description: string;
  hook: string;
  emotionalArc: string;
  plotTwists: string[];
  chapters: ChapterOutline[];
}

export interface GeneratedChapter {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface GenerationProgress {
  type: 'outline' | 'chapter_start' | 'chapter_content' | 'chapter_complete' | 'progress' | 'error' | 'complete';
  data?: any;
  progress?: number;
  message?: string;
}

export interface NovelDraft {
  id: string;
  title: string;
  description: string;
  genre: string;
  hook: string;
  chapters: GeneratedChapter[];
  outline: NovelOutline | null;
  createdAt: number;
  updatedAt: number;
}

const DRAFT_KEY = 'ai_novel_drafts';

/**
 * 流式生成小说
 * 使用 SSE (Server-Sent Events) 接收实时生成进度
 */
export async function* streamGenerateNovel(
  params: AIGenerationParams,
  abortSignal?: AbortSignal
): AsyncGenerator<GenerationProgress, void, unknown> {
  const response = await fetch('/api/novels/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify(params),
    signal: abortSignal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  if (!reader) throw new Error('No reader available');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed: GenerationProgress = JSON.parse(data);
            yield parsed;
          } catch {
            // 非 JSON 行，可能是原始文本
            yield { type: 'chapter_content' as const, data: { content: data } };
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 非流式生成小说（降级方案）
 */
export async function generateNovel(params: AIGenerationParams): Promise<NovelDraft> {
  const { data } = await apiClient.post('/novels/generate', params);
  return data;
}

/**
 * 保存小说到后端
 */
export async function saveNovel(draft: NovelDraft): Promise<{ id: number }> {
  const { data } = await apiClient.post('/novels', {
    title: draft.title,
    description: draft.description,
    genre: draft.genre,
    hook: draft.hook,
    chapters: draft.chapters.map((c) => ({
      title: c.title,
      content: c.content,
      chapterNumber: c.chapterNumber,
    })),
  });
  return data;
}

/* ------------------------------------------------------------------ */
/*  本地草稿存储                                                       */
/* ------------------------------------------------------------------ */

export const draftStorage = {
  /** 获取所有草稿 */
  getAll(): NovelDraft[] {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return [];
      const drafts = JSON.parse(raw) as NovelDraft[];
      return Array.isArray(drafts) ? drafts : [];
    } catch {
      return [];
    }
  },

  /** 保存草稿 */
  save(draft: NovelDraft): void {
    try {
      const drafts = this.getAll();
      const existingIndex = drafts.findIndex((d) => d.id === draft.id);
      const updatedDraft = { ...draft, updatedAt: Date.now() };

      if (existingIndex >= 0) {
        drafts[existingIndex] = updatedDraft;
      } else {
        drafts.unshift(updatedDraft);
      }

      // 最多保留 10 个草稿
      const trimmed = drafts.slice(0, 10);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  },

  /** 删除草稿 */
  delete(id: string): void {
    try {
      const drafts = this.getAll().filter((d) => d.id !== id);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to delete draft:', e);
    }
  },

  /** 根据 ID 获取草稿 */
  getById(id: string): NovelDraft | null {
    return this.getAll().find((d) => d.id === id) || null;
  },

  /** 清空所有草稿 */
  clear(): void {
    localStorage.removeItem(DRAFT_KEY);
  },
};
