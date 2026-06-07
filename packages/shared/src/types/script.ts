export type ScriptDifficulty = 'easy' | 'medium' | 'hard';
export type ScriptStatus = 'generating' | 'draft' | 'published' | 'archived';
export type CharacterType = 'protagonist' | 'antagonist' | 'supporting' | 'npc';
export type CharacterGender = 'male' | 'female' | 'neutral';
export type DialogueType = 'dialogue' | 'narration' | 'stage_direction';

export interface Script {
  id: number;
  novelId: number;
  userId: number;
  title: string;
  yamlContent: string;
  description?: string;
  difficulty: ScriptDifficulty;
  playerCountMin: number;
  playerCountMax: number;
  estimatedDuration: number;
  status: ScriptStatus;
  version: number;
  characters: Character[];
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: number;
  scriptId: number;
  name: string;
  type: CharacterType;
  gender: CharacterGender;
  age?: number;
  personality: string;
  background: string;
  appearance?: string;
  secret?: string;
  motivation?: string;
  isPlayable: boolean;
  aiPrompt?: string;
}

export interface Scene {
  id: number;
  scriptId: number;
  sceneNumber: number;
  title: string;
  location?: string;
  time?: string;
  description: string;
  atmosphere?: string;
  dialogues: Dialogue[];
  choices?: Choice[];
}

export interface Dialogue {
  id: number;
  sceneId: number;
  characterId?: number;
  dialogueOrder: number;
  content: string;
  emotion?: string;
  action?: string;
  type: DialogueType;
}

export interface Choice {
  id: number;
  sceneId: number;
  triggerDialogueId: number;
  text: string;
  targetSceneId: number;
  condition?: any;
  consequence?: string;
  sortOrder: number;
}
