import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useApiError } from './useApiError';
import { Room } from '../types';
import { roomApi } from '../services/api';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { socket } = useSocket();
  const { handleApiError } = useApiError();

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.getRooms();
      setRooms(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      await roomApi.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (error) {
      handleApiError(error);
    }
  }, [handleApiError]);

  useEffect(() => {
    if (!socket) return;

    const handlers = {
      'room:created': (room: Room) => {
        setRooms((prev) => [...prev, room]);
      },
      'room:deleted': (roomId: string) => {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
      },
      'room:updated': (updatedRoom: Room) => {
        setRooms((prev) =>
          prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
        );
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    fetchRooms();

    return () => {
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, fetchRooms]);

  return {
    rooms,
    loading,
    error,
    deleteRoom,
    refreshRooms: fetchRooms,
  };
} 