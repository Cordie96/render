import { useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useApiError } from './useApiError';
import { playerApi } from '../services/playerApi';

export function usePlayerControls(roomId: string) {
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const play = useCallback(async () => {
    try {
      await playerApi.play(roomId);
      socket?.emit('player:play', { roomId });
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, socket, handleApiError]);

  const pause = useCallback(async () => {
    try {
      await playerApi.pause(roomId);
      socket?.emit('player:pause', { roomId });
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, socket, handleApiError]);

  const seek = useCallback(async (time: number) => {
    try {
      await playerApi.seek(roomId, time);
      socket?.emit('player:seek', { roomId, time });
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, socket, handleApiError]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await playerApi.setVolume(roomId, volume);
      socket?.emit('player:volume', { roomId, volume });
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, socket, handleApiError]);

  return {
    play,
    pause,
    seek,
    setVolume,
  };
} 