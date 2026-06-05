export type NovelStatus = 'generating' | 'draft' | 'published' | 'archived';
export type NovelGenre = 'suspense' | 'fantasy' | 'scifi' | 'romance' | 'horror' | 'action' | 'comedy' | 'drama' | 'other';

export interface Novel {
  id: number;
  userId: number;
  title: string;
  description?: string;
  coverUrl?: string;
  content: string;
  genre: NovelGenre;
  wordCount: number;
  status: NovelStatus;
  aiModelUsed?: string;
  aiPrompt?: string;
  viewCount: number;
  likeCount: number;
  avgRating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NovelListItem {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  genre: NovelGenre;
  wordCount: number;
  status: NovelStatus;
  tags: string[];
  viewCount: number;
  avgRating: number;
  createdAt: string;
}

export interface GenerateNovelRequest {
  prompt: string;
  genre?: NovelGenre;
  wordCountTarget?: number;
  chapterCount?: number;
  title?: string;
}

export interface NovelListQuery {
  page?: number;
  pageSize?: number;
  genre?: NovelGenre;
  status?: NovelStatus;
  search?: string;
  sort?: 'latest' | 'popular' | 'rating';
}
