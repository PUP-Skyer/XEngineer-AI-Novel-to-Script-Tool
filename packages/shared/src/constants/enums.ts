export const NOVEL_STATUS = { GENERATING: 'generating', DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' } as const;
export const NOVEL_GENRES = { SUSPENSE: 'suspense', FANTASY: 'fantasy', SCIFI: 'scifi', ROMANCE: 'romance', HORROR: 'horror', ACTION: 'action', COMEDY: 'comedy', DRAMA: 'drama', OTHER: 'other' } as const;
export const SCRIPT_DIFFICULTIES = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' } as const;
export const GAME_MODES = { SINGLE: 'single', MULTI: 'multi' } as const;
export const GAME_STATUS = { WAITING: 'waiting', CHARACTER_SELECT: 'character_select', PLAYING: 'playing', VOTING: 'voting', FINISHED: 'finished', CANCELLED: 'cancelled' } as const;
export const CHARACTER_TYPES = { PROTAGONIST: 'protagonist', ANTAGONIST: 'antagonist', SUPPORTING: 'supporting', NPC: 'npc' } as const;
