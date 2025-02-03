import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useApiError } from './useApiError';
import { QueueItem } from '../types';
import { playerApi } from '../services/api';

export function usePlayerState(roomId: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchPlayerState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playerApi.getPlayerState(roomId);
      setIsPlaying(data.isPlaying);
      setCurrentTime(data.currentTime);
      setDuration(data.duration);
      setCurrentItem(data.currentItem);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleApiError]);

  const handlePlay = useCallback(async () => {
    try {
      await playerApi.play(roomId);
      setIsPlaying(true);
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  const handlePause = useCallback(async () => {
    try {
      await playerApi.pause(roomId);
      setIsPlaying(false);
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  const handleSeek = useCallback(async (time: number) => {
    try {
      await playerApi.seek(roomId, time);
      setCurrentTime(time);
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  useEffect(() => {
    if (!socket) return;

    const handlers = {
      'player:state-changed': (data: {
        isPlaying: boolean;
        currentTime: number;
        duration: number;
        currentItem: QueueItem | null;
      }) => {
        setIsPlaying(data.isPlaying);
        setCurrentTime(data.currentTime);
        setDuration(data.duration);
        setCurrentItem(data.currentItem);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    fetchPlayerState();

    return () => {
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, fetchPlayerState]);

  return {
    isPlaying,
    currentTime,
    duration,
    currentItem,
    loading,
    error,
    handlePlay,
    handlePause,
    handleSeek,
  };
} 