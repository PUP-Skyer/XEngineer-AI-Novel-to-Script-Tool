import apiClient from './apiClient';
import { io, type Socket } from 'socket.io-client';
import type {
  GameSession,
  CreateRoomRequest,
  JoinRoomRequest,
  PlayerSpeakRequest,
  MakeChoiceRequest,
  GameLog,
} from '@asg/shared';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';

let socket: Socket | null = null;

export const gameService = {
  /** 创建游戏房间 */
  async createRoom(request: CreateRoomRequest): Promise<GameSession> {
    const { data } = await apiClient.post('/game/rooms', request);
    return data;
  },

  /** 加入游戏房间 */
  async joinRoom(request: JoinRoomRequest): Promise<GameSession> {
    const { data } = await apiClient.post('/game/rooms/join', request);
    return data;
  },

  /** 获取游戏房间信息 */
  async getRoom(roomCode: string): Promise<GameSession> {
    const { data } = await apiClient.get(`/game/rooms/${roomCode}`);
    return data;
  },

  /** 获取游戏日志 */
  async getGameLogs(sessionId: number): Promise<GameLog[]> {
    const { data } = await apiClient.get(`/game/sessions/${sessionId}/logs`);
    return data;
  },

  /** 玩家发言 */
  async speak(request: PlayerSpeakRequest): Promise<void> {
    await apiClient.post('/game/speak', request);
  },

  /** 做出选择 */
  async makeChoice(request: MakeChoiceRequest): Promise<void> {
    await apiClient.post('/game/choice', request);
  },

  /** 获取可用剧本列表 */
  async getAvailableScripts(): Promise<
    Array<{ id: number; title: string; playerCountMin: number; playerCountMax: number; difficulty: string }>
  > {
    const { data } = await apiClient.get('/game/scripts');
    return data;
  },

  /** 连接 WebSocket */
  connect(roomCode: string): Socket {
    if (socket?.connected) {
      socket.disconnect();
    }

    const tokens = useAuthStore.getState().tokens;
    const { setConnected, addLog, setPlayers, setCurrentChoices, setSession } =
      useGameStore.getState();

    socket = io({
      path: '/socket.io',
      auth: {
        token: tokens?.accessToken,
        roomCode,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('game:log', (log: GameLog) => {
      addLog(log);
    });

    socket.on('game:players', (players: any[]) => {
      setPlayers(players);
    });

    socket.on('game:choices', (choices: any[]) => {
      setCurrentChoices(choices);
    });

    socket.on('game:update', (session: GameSession) => {
      setSession(session);
    });

    return socket;
  },

  /** 断开 WebSocket */
  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    useGameStore.getState().setConnected(false);
  },

  /** 获取当前 socket 实例 */
  getSocket(): Socket | null {
    return socket;
  },
};
