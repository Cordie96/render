import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { roomService } from '../services/roomService';
import { Room, RoomSettings } from '../types';
import { useApiError } from './useApiError';
import { notificationService } from '../services/notificationService';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomService.getRoom(roomId);
      setRoom(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleApiError]);

  const updateSettings = useCallback(async (settings: Partial<RoomSettings>) => {
    try {
      const updatedRoom = await roomService.updateSettings(roomId, settings);
      setRoom(updatedRoom);
      notificationService.success('Room settings updated');
    } catch (error) {
      handleApiError(error);
    }
  }, [roomId, handleApiError]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:updated', setRoom);
    socket.on('room:deleted', () => {
      notificationService.info('This room has been deleted');
      // Handle navigation or cleanup
    });

    return () => {
      socket.off('room:updated');
      socket.off('room:deleted');
    };
  }, [socket]);

  return {
    room,
    loading,
    updateSettings,
    refresh: fetchRoom,
  };
} 