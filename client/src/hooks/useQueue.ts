import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { QueueItem } from '../types';
import { useApiError } from './useApiError';
import { notificationService } from '../services/notificationService';
import { api } from '../services/api';

interface UseQueueOptions {
  roomId: string;
  onQueueUpdate?: (queue: QueueItem[]) => void;
}

export function useQueue({ roomId, onQueueUpdate }: UseQueueOptions) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<QueueItem[]>(`/rooms/${roomId}/queue`);
      setQueue(data);
      onQueueUpdate?.(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, onQueueUpdate, handleApiError]);

  const addToQueue = useCallback(async (video: { youtubeVideoId: string; title: string }) => {
    try {
      await api.post(`/rooms/${roomId}/queue`, video);
      notificationService.success('Added to queue');
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  const removeFromQueue = useCallback(async (itemId: string) => {
    try {
      await api.delete(`/rooms/${roomId}/queue/${itemId}`);
      notificationService.success('Removed from queue');
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  const reorderQueue = useCallback(async (fromIndex: number, toIndex: number) => {
    try {
      await api.post(`/rooms/${roomId}/queue/reorder`, { fromIndex, toIndex });
    } catch (error) {
      handleApiError(error);
      // Revert the optimistic update
      fetchQueue();
    }
  }, [roomId, handleApiError, fetchQueue]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queue:updated', (updatedQueue: QueueItem[]) => {
      setQueue(updatedQueue);
      onQueueUpdate?.(updatedQueue);
    });

    return () => {
      socket.off('queue:updated');
    };
  }, [socket, onQueueUpdate]);

  return {
    queue,
    loading,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    refresh: fetchQueue,
  };
} 