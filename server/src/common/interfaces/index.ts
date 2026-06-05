import { JwtPayload } from '../decorators/current-user.decorator';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface SocketWithUser {
  userId: number;
  username: string;
}

export enum GamePhase {
  LOBBY = 'lobby',
  INTRO = 'intro',
  READING = 'reading',
  DISCUSSION = 'discussion',
  ACCUSATION = 'accusation',
  VOTING = 'voting',
  REVEAL = 'reveal',
  ENDED = 'ended',
}

export enum GameEventType {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  PLAYER_SPEAK = 'player_speak',
  PLAYER_CHOOSE = 'player_choose',
  ACCUSATION = 'accusation',
  VOTE = 'vote',
  PHASE_CHANGE = 'phase_change',
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  AI_SPEAK = 'ai_speak',
  SCENE_CHANGE = 'scene_change',
  ERROR = 'error',
}

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
  roomId: string;
  userId?: number;
}

export interface NovelGenerationRequest {
  prompt: string;
  genre: string;
  wordCountTarget?: number;
  chapterCount?: number;
}

export interface ScriptConversionResult {
  yamlContent: string;
  characters: ScriptCharacter[];
  scenes: ScriptScene[];
  metadata: ScriptMetadata;
  choices?: ScriptChoice[];
}

export interface ScriptCharacter {
  id: string;
  name: string;
  alias?: string;
  description: string;
  personality?: string;
  backstory?: string;
  secret?: string;
  motivation?: string;
  relationships?: string;
  isKiller?: boolean;
  imageUrl?: string;
}

export interface ScriptScene {
  id: string;
  title: string;
  location: string;
  time: string;
  description: string;
  atmosphere?: string;
  dialogues: ScriptDialogue[];
  choices?: ScriptChoice[];
}

export interface ScriptDialogue {
  characterId: string | null;
  type?: 'dialogue' | 'narration' | 'narration_dm' | 'stage_direction';
  content: string;
  action?: string;
  emotion?: string;
  stageDirection?: string;
}

export interface ScriptChoice {
  id: string;
  text: string;
  targetSceneId: string;
  condition?: string;
  consequence?: string;
}

export interface ScriptMetadata {
  title: string;
  author: string;
  playerCount: { min: number; max: number };
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  genre: string;
  synopsis: string;
}
