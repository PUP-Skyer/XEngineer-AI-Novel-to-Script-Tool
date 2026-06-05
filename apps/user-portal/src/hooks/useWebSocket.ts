import { useEffect, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

interface UseWebSocketOptions {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (event: string, data: any) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
}

export function useWebSocket({
  url,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  autoConnect = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const tokens = useAuthStore.getState().tokens;

    const socket = io(url, {
      auth: {
        token: tokens?.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      connectedRef.current = true;
      onConnect?.();
    });

    socket.on('disconnect', () => {
      connectedRef.current = false;
      onDisconnect?.();
    });

    socket.onAny((event: string, ...args: any[]) => {
      onMessage?.(event, args[0]);
    });

    socket.on('connect_error', (error: Error) => {
      onError?.(error);
    });

    socketRef.current = socket;
  }, [url, onConnect, onDisconnect, onMessage, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      connectedRef.current = false;
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: connectedRef.current,
    connect,
    disconnect,
    emit,
  };
}
