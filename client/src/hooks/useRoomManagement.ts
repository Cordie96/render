import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useError } from './useError';
import { roomApi } from '../utils/api';
import { Room } from '../types';

export function useRoomManagement(roomId?: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { handleError } = useError();

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const { data } = await roomApi.getRoom(roomId);
      setRoom(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [roomId, handleError]);

  const createRoom = useCallback(async (name: string) => {
    try {
      setLoading(true);
      const { data } = await roomApi.createRoom(name);
      setRoom(data);
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateRoom = useCallback(async (updates: Partial<Room>) => {
    if (!room) return;

    try {
      const { data } = await roomApi.updateRoom(room.id, updates);
      setRoom(data);
    } catch (error) {
      handleError(error);
    }
  }, [room, handleError]);

  const closeRoom = useCallback(async () => {
    if (!room) return;

    try {
      await roomApi.closeRoom(room.id);
      setRoom(null);
    } catch (error) {
      handleError(error);
    }
  }, [room, handleError]);

  useEffect(() => {
    if (roomId && socket) {
      socket.emit('join-room', roomId);
      fetchRoom();

      return () => {
        socket.emit('leave-room', roomId);
      };
    }
  }, [roomId, socket, fetchRoom]);

  return {
    room,
    loading,
    createRoom,
    updateRoom,
    closeRoom,
    refreshRoom: fetchRoom,
  };
} 