const BASE = '/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE}/auth/register`,
    LOGIN: `${BASE}/auth/login`,
    REFRESH: `${BASE}/auth/refresh`,
    LOGOUT: `${BASE}/auth/logout`,
    ME: `${BASE}/auth/me`,
  },
  NOVELS: {
    LIST: `${BASE}/novels`,
    DETAIL: (id: number) => `${BASE}/novels/${id}`,
    GENERATE: `${BASE}/novels/generate`,
    GENERATE_STATUS: (taskId: string) => `${BASE}/novels/generate/status/${taskId}`,
  },
  SCRIPTS: {
    CONVERT: (novelId: number) => `${BASE}/scripts/convert/${novelId}`,
    DETAIL: (id: number) => `${BASE}/scripts/${id}`,
    YAML: (id: number) => `${BASE}/scripts/${id}/yaml`,
    CHARACTERS: (id: number) => `${BASE}/scripts/${id}/characters`,
    SCENES: (id: number) => `${BASE}/scripts/${id}/scenes`,
    VALIDATE: (id: number) => `${BASE}/scripts/${id}/validate`,
    LIST: `${BASE}/scripts`,
  },
  GAMES: {
    CREATE_ROOM: `${BASE}/games/rooms`,
    ROOM: (code: string) => `${BASE}/games/rooms/${code}`,
    JOIN_ROOM: (code: string) => `${BASE}/games/rooms/${code}/join`,
    START_ROOM: (code: string) => `${BASE}/games/rooms/${code}/start`,
    SINGLE: (scriptId: number) => `${BASE}/games/single/${scriptId}`,
    HISTORY: `${BASE}/games/history`,
  },
  ADMIN: {
    DASHBOARD: `${BASE}/admin/dashboard`,
    USERS: `${BASE}/admin/users`,
    AI_MODELS: `${BASE}/admin/ai-models`,
  },
} as const;
