export type GameMode = 'single' | 'multi';
export type GameStatus = 'waiting' | 'character_select' | 'playing' | 'voting' | 'finished' | 'cancelled';
export type GameActionType = 'speak' | 'choice' | 'accuse' | 'vote' | 'system';

export interface GameSession {
  id: number;
  scriptId: number;
  hostUserId: number;
  roomCode: string;
  mode: GameMode;
  status: GameStatus;
  currentSceneId?: number;
  currentTurn: number;
  players: GamePlayer[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface GamePlayer {
  id: number;
  sessionId: number;
  userId?: number;
  characterId: number;
  characterName?: string;
  isAi: boolean;
  isAlive: boolean;
  score: number;
  joinedAt: string;
}

export interface GameLog {
  id: number;
  sessionId: number;
  playerId?: number;
  sceneId: number;
  actionType: GameActionType;
  content: string;
  turnNumber: number;
  createdAt: string;
}

export interface CreateRoomRequest {
  scriptId: number;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface PlayerSpeakRequest {
  roomId: number;
  content: string;
  emotion?: string;
}

export interface MakeChoiceRequest {
  roomId: number;
  choiceId: number;
}

export interface GameResult {
  sessionId: number;
  rankings: GameRanking[];
  totalTurns: number;
  ending: string;
}

export interface GameRanking {
  playerId: number;
  characterName: string;
  score: number;
  isAi: boolean;
}
