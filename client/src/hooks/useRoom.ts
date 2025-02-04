import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { roomService } from '../services/roomService';
import { Room, RoomSettings } from '../types';
import { useApiError } from './useApiError';
import { notificationService } from '../services/notificationService';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomService.getRoom(roomId);
      setRoom(data);
      setError(null);
    } catch (err) {
      handleApiError(err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleApiError]);

  const updateSettings = useCallback(async (settings: RoomSettings) => {
    try {
      const updatedRoom = await roomService.updateSettings(roomId, settings);
      setRoom(updatedRoom);
      notificationService.success('Room settings updated successfully');
      
      // Emit socket event to notify other users
      socket?.emit('room:settings-updated', {
        roomId,
        settings: updatedRoom.settings,
      });
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  }, [roomId, socket, handleApiError]);

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

  // Add socket listener for settings updates
  useEffect(() => {
    if (!socket) return;

    const handleSettingsUpdate = (data: { settings: Room['settings'] }) => {
      setRoom(prev => prev ? { ...prev, settings: data.settings } : null);
    };

    socket.on(`room:${roomId}:settings-updated`, handleSettingsUpdate);

    return () => {
      socket.off(`room:${roomId}:settings-updated`, handleSettingsUpdate);
    };
  }, [socket, roomId]);

  return {
    room,
    loading,
    error,
    updateSettings,
    refresh: fetchRoom,
  };
} 