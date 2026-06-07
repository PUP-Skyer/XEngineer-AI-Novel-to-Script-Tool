import { getApiClient } from '../client';
import type { ApiResponse, GameSession, GameResult } from '@asg/shared';
import { API_ENDPOINTS } from '@asg/shared';

export const gameApi = {
  createRoom: (scriptId: number) =>
    getApiClient().post<ApiResponse<GameSession>>(API_ENDPOINTS.GAMES.CREATE_ROOM, { scriptId }),

  getRoom: (code: string) =>
    getApiClient().get<ApiResponse<GameSession>>(API_ENDPOINTS.GAMES.ROOM(code)),

  joinRoom: (code: string) =>
    getApiClient().post<ApiResponse<GameSession>>(API_ENDPOINTS.GAMES.JOIN_ROOM(code)),

  startRoom: (code: string) =>
    getApiClient().post<ApiResponse<void>>(API_ENDPOINTS.GAMES.START_ROOM(code)),

  createSingleGame: (scriptId: number) =>
    getApiClient().post<ApiResponse<GameSession>>(API_ENDPOINTS.GAMES.SINGLE(scriptId)),

  getResult: (sessionId: number) =>
    getApiClient().get<ApiResponse<GameResult>>(`${API_ENDPOINTS.GAMES.HISTORY}/${sessionId}`),

  getHistory: (params?: { page?: number; pageSize?: number }) =>
    getApiClient().get(API_ENDPOINTS.GAMES.HISTORY, { params }),
};
