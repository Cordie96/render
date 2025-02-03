import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface QueueItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  position: number;
  status: 'pending' | 'playing' | 'completed';
}

interface PlayerCommand {
  command: 'play' | 'pause' | 'seek';
  timestamp?: number;
}

interface ServerToClientEvents {
  'queue-updated': (data: {
    type: 'add' | 'remove' | 'update' | 'reorder';
    item?: QueueItem;
    items?: QueueItem[];
  }) => void;
  'player-command': (command: PlayerCommand) => void;
  'room-closed': () => void;
  'error': (error: { message: string }) => void;
}

interface ClientToServerEvents {
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'player-command': (data: { roomId: string; command: PlayerCommand }) => void;
  'add-to-queue': (data: {
    roomId: string;
    video: { youtubeVideoId: string; title: string };
  }) => void;
  'remove-from-queue': (data: { roomId: string; itemId: string }) => void;
  'reorder-queue': (data: {
    roomId: string;
    startIndex: number;
    endIndex: number;
  }) => void;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: {
        token,
      },
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'unauthorized') {
        // Handle unauthorized error
        window.location.href = '/login';
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const emit = useCallback(<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => {
    if (socket) {
      socket.emit(event, ...args);
    }
  }, [socket]);

  const on = useCallback(<T extends keyof ServerToClientEvents>(
    event: T,
    callback: ServerToClientEvents[T]
  ) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, [socket]);

  return { socket, emit, on };
} 