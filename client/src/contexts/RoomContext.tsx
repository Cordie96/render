import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../utils/api';

interface Room {
  id: string;
  name: string;
  hostId: string;
  isActive: boolean;
}

interface RoomContextType {
  room: Room | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
  updateRoom: (data: Partial<Room>) => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roomId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/api/rooms/${roomId}`);
        setRoom(data);
      } catch (error) {
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const updateRoom = (data: Partial<Room>) => {
    setRoom(prev => prev ? { ...prev, ...data } : null);
  };

  const isHost = Boolean(room && user && room.hostId === user.id);

  return (
    <RoomContext.Provider value={{ room, isHost, loading, error, updateRoom }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
} 