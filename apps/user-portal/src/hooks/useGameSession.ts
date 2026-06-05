import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { gameService } from '@/services/gameService';
import type { GameLog, GamePlayer } from '@asg/shared';

interface UseGameSessionOptions {
  roomCode: string;
}

export function useGameSession({ roomCode }: UseGameSessionOptions) {
  const {
    session,
    players,
    logs,
    currentChoices,
    isConnected,
    loading,
    error,
    setSession,
    setPlayers,
    addLog,
    setLogs,
    setCurrentChoices,
    clearChoices,
    setLoading,
    setError,
    reset,
  } = useGameStore();

  // Connect to WebSocket when room code is available
  useEffect(() => {
    if (!roomCode) return;

    const socket = gameService.connect(roomCode);

    return () => {
      gameService.disconnect();
      reset();
    };
  }, [roomCode, reset]);

  // Join the game room
  const joinRoom = useCallback(
    async (roomCodeStr: string) => {
      setLoading(true);
      setError(null);
      try {
        const sessionData = await gameService.joinRoom({ roomCode: roomCodeStr });
        setSession(sessionData);
        setPlayers(sessionData.players);
        return sessionData;
      } catch (err: any) {
        setError(err.message || '加入房间失败');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSession, setPlayers, setLoading, setError],
  );

  // Speak in the game
  const speak = useCallback(
    async (content: string, emotion?: string) => {
      if (!session) return;
      try {
        await gameService.speak({
          roomId: session.id,
          content,
          emotion,
        });
      } catch (err: any) {
        setError(err.message || '发言失败');
      }
    },
    [session, setError],
  );

  // Make a choice
  const makeChoice = useCallback(
    async (choiceId: number) => {
      if (!session) return;
      try {
        clearChoices();
        await gameService.makeChoice({
          roomId: session.id,
          choiceId,
        });
      } catch (err: any) {
        setError(err.message || '选择失败');
      }
    },
    [session, clearChoices, setError],
  );

  return {
    session,
    players,
    logs,
    currentChoices,
    isConnected,
    loading,
    error,
    joinRoom,
    speak,
    makeChoice,
  };
}
