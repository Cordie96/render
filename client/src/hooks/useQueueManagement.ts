import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { queueApi } from '../utils/api';
import { useError } from './useError';

export interface QueueItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  position: number;
  status: 'pending' | 'playing' | 'completed';
  addedById: string;
}

export function useQueueManagement(roomId: string) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, emit, on } = useSocket();
  const { handleError } = useError();

  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await queueApi.getQueue(roomId);
      setQueue(data.queue);
      setCurrentItem(data.currentItem);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleError]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!socket) return;

    const unsubscribers = [
      on('queue-updated', (data) => {
        switch (data.type) {
          case 'add':
            if (data.item) {
              setQueue(prev => [...prev, data.item]);
            }
            break;
          case 'remove':
            if (data.item) {
              setQueue(prev => prev.filter(item => item.id !== data.item!.id));
            }
            break;
          case 'update':
            if (data.item) {
              if (data.item.status === 'playing') {
                setCurrentItem(data.item);
                setQueue(prev => prev.filter(item => item.id !== data.item!.id));
              } else if (data.item.status === 'completed') {
                setCurrentItem(null);
              }
            }
            break;
          case 'reorder':
            if (data.items) {
              setQueue(data.items);
            }
            break;
        }
      }),
    ];

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [socket, on]);

  const addToQueue = useCallback(async (video: { youtubeVideoId: string; title: string }) => {
    try {
      const { data } = await queueApi.addToQueue(roomId, video);
      emit('add-to-queue', { roomId, video });
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [roomId, emit, handleError]);

  const removeFromQueue = useCallback(async (itemId: string) => {
    try {
      await queueApi.removeFromQueue(roomId, itemId);
      emit('remove-from-queue', { roomId, itemId });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [roomId, emit, handleError]);

  const reorderQueue = useCallback(async (startIndex: number, endIndex: number) => {
    try {
      const { data } = await queueApi.reorderQueue(roomId, startIndex, endIndex);
      emit('reorder-queue', { roomId, startIndex, endIndex });
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [roomId, emit, handleError]);

  return {
    queue,
    currentItem,
    loading,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    refreshQueue: fetchQueue,
  };
} 