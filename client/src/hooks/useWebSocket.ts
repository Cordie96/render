import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useError } from './useError';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket({
  url,
  autoConnect = true,
  reconnectionAttempts = 5,
  reconnectionDelay = 1000,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { handleError } = useError();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(url, {
      autoConnect: false,
      reconnection: false, // We'll handle reconnection manually
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      onDisconnect?.();
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      handleError(error);
      onError?.(error);

      if (reconnectAttemptsRef.current < reconnectionAttempts) {
        reconnectAttemptsRef.current++;
        setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttemptsRef.current}`);
          socketRef.current?.connect();
        }, reconnectionDelay * reconnectAttemptsRef.current);
      }
    });

    socketRef.current.connect();
  }, [url, reconnectionAttempts, reconnectionDelay, onConnect, onDisconnect, onError, handleError]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    reconnectAttemptsRef.current = 0;
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
    connect,
    disconnect,
    reconnect: connect,
  };
} 