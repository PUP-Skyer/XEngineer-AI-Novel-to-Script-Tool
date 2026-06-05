import { create } from 'zustand';
import type { GameSession, GamePlayer, GameLog } from '@asg/shared';

interface GameState {
  session: GameSession | null;
  players: GamePlayer[];
  logs: GameLog[];
  currentChoices: Array<{
    id: number;
    text: string;
    consequence?: string;
  }>;
  isConnected: boolean;
  loading: boolean;
  error: string | null;

  setSession: (session: GameSession | null) => void;
  setPlayers: (players: GamePlayer[]) => void;
  addLog: (log: GameLog) => void;
  setLogs: (logs: GameLog[]) => void;
  setCurrentChoices: (
    choices: Array<{ id: number; text: string; consequence?: string }>,
  ) => void;
  clearChoices: () => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  session: null,
  players: [],
  logs: [],
  currentChoices: [],
  isConnected: false,
  loading: false,
  error: null,

  setSession: (session) => set({ session }),
  setPlayers: (players) => set({ players }),
  addLog: (log) =>
    set((state) => ({ logs: [...state.logs, log] })),
  setLogs: (logs) => set({ logs }),
  setCurrentChoices: (choices) => set({ currentChoices: choices }),
  clearChoices: () => set({ currentChoices: [] }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      session: null,
      players: [],
      logs: [],
      currentChoices: [],
      isConnected: false,
      loading: false,
      error: null,
    }),
}));
