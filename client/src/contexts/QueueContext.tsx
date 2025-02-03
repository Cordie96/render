import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useApiError } from '../hooks/useApiError';
import { QueueItem } from '../types';
import { queueApi } from '../services/api';

interface QueueContextValue {
  queue: QueueItem[];
  currentItem: QueueItem | null;
  loading: boolean;
  error: Error | null;
  addToQueue: (video: { youtubeVideoId: string; title: string }) => Promise<void>;
  removeFromQueue: (itemId: string) => Promise<void>;
  reorderQueue: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  skipCurrent: () => Promise<void>;
}

const QueueContext = createContext<QueueContextValue | null>(null);

interface QueueProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export function QueueProvider({ children, roomId }: QueueProviderProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queueApi.getQueue(roomId);
      setQueue(data.queue);
      setCurrentItem(data.currentItem);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleApiError]);

  useEffect(() => {
    if (!socket) return;

    const handlers = {
      'queue:updated': (data: { queue: QueueItem[]; currentItem: QueueItem | null }) => {
        setQueue(data.queue);
        setCurrentItem(data.currentItem);
      },
      'queue:item-added': (item: QueueItem) => {
        setQueue((prev) => [...prev, item]);
      },
      'queue:item-removed': (itemId: string) => {
        setQueue((prev) => prev.filter((item) => item.id !== itemId));
      },
      'queue:reordered': (data: { queue: QueueItem[] }) => {
        setQueue(data.queue);
      },
      'queue:current-changed': (item: QueueItem | null) => {
        setCurrentItem(item);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    fetchQueue();

    return () => {
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, fetchQueue]);

  const value: QueueContextValue = {
    queue,
    currentItem,
    loading,
    error,
    addToQueue: useCallback(
      async (video) => {
        try {
          await queueApi.addToQueue(roomId, video);
        } catch (error) {
          handleApiError(error);
          throw error;
        }
      },
      [roomId, handleApiError]
    ),
    removeFromQueue: useCallback(
      async (itemId) => {
        try {
          await queueApi.removeFromQueue(roomId, itemId);
        } catch (error) {
          handleApiError(error);
          throw error;
        }
      },
      [roomId, handleApiError]
    ),
    reorderQueue: useCallback(
      async (sourceIndex, destinationIndex) => {
        try {
          await queueApi.reorderQueue(roomId, sourceIndex, destinationIndex);
        } catch (error) {
          handleApiError(error);
          throw error;
        }
      },
      [roomId, handleApiError]
    ),
    skipCurrent: useCallback(async () => {
      try {
        await queueApi.skipCurrent(roomId);
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    }, [roomId, handleApiError]),
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue(roomId: string) {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
} 