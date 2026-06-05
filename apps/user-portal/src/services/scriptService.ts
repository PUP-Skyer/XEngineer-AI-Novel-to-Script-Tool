import apiClient from './apiClient';

export interface ScriptConvertResponse {
  taskId: string;
}

export interface ScriptConvertStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  scriptId?: number;
  error?: string;
}

export interface ScriptDetail {
  id: number;
  novelId: number;
  title: string;
  yamlContent: string;
  description: string;
  difficulty: string;
  playerCountMin: number;
  playerCountMax: number;
  estimatedDuration: number;
  status: string;
  version: number;
  characters: CharacterData[];
  scenes: SceneData[];
}

export interface CharacterData {
  id: number;
  scriptId: number;
  name: string;
  characterId: string;
  role: string;
  gender: string;
  age: number;
  personality: string;
  backstory: string;
  secrets: string;
  objectives: string;
  relationships: string;
  isPlayerControlled: boolean;
  aiPrompt: string;
}

export interface SceneData {
  id: number;
  scriptId: number;
  sceneNumber: number;
  title: string;
  location: string;
  time: string;
  description: string;
  mood: string;
  dialogues: DialogueData[];
}

export interface DialogueData {
  id: number;
  sceneId: number;
  characterIdRef: string;
  content: string;
  action: string;
  emotion: string;
  stageDirection: string;
  scriptId: number;
}

export interface ScriptListItem {
  id: number;
  novelId: number;
  title: string;
  description: string;
  difficulty: string;
  playerCountMin: number;
  playerCountMax: number;
  estimatedDuration: number;
  status: string;
  createdAt: string;
}

const scriptService = {
  /**
   * 触发小说→剧本转换（异步）
   */
  async convertNovel(novelId: number): Promise<ScriptConvertResponse> {
    const response = await apiClient.post(`/v1/scripts/convert/${novelId}`);
    return response.data.data;
  },

  /**
   * 查询转换进度
   */
  async getConvertStatus(taskId: string): Promise<ScriptConvertStatus> {
    const response = await apiClient.get(`/v1/scripts/task/${taskId}`);
    return response.data.data;
  },

  /**
   * 获取剧本详情
   */
  async getScriptDetail(id: number): Promise<ScriptDetail> {
    const response = await apiClient.get(`/v1/scripts/${id}`);
    return response.data.data;
  },

  /**
   * 获取剧本 YAML 内容
   */
  async getScriptYaml(id: number): Promise<string> {
    const response = await apiClient.get(`/v1/scripts/${id}/yaml`);
    return response.data.data.yamlContent;
  },

  /**
   * 获取剧本角色列表
   */
  async getScriptCharacters(id: number): Promise<CharacterData[]> {
    const response = await apiClient.get(`/v1/scripts/${id}/characters`);
    return response.data.data;
  },

  /**
   * 获取剧本场景列表
   */
  async getScriptScenes(id: number): Promise<SceneData[]> {
    const response = await apiClient.get(`/v1/scripts/${id}/scenes`);
    return response.data.data;
  },

  /**
   * 更新剧本
   */
  async updateScript(id: number, data: Partial<ScriptDetail>): Promise<ScriptDetail> {
    const response = await apiClient.patch(`/v1/scripts/${id}`, data);
    return response.data.data;
  },

  /**
   * 获取剧本列表（我的剧本）
   */
  async getScriptList(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: ScriptListItem[]; total: number }> {
    const response = await apiClient.get('/v1/scripts', { params });
    return response.data.data;
  },
};

export default scriptService;
