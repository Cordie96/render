import api from './api';
import { Room, RoomSettings } from '../types';
import { cacheService } from './cacheService';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const roomService = {
  createRoom: async (settings: RoomSettings) => {
    const { data } = await api.post<Room>('/rooms', settings);
    return data;
  },

  getRoom: async (roomId: string) => {
    const cached = cacheService.get<Room>(`room:${roomId}`);
    if (cached) return cached;

    const { data } = await api.get<Room>(`/rooms/${roomId}`);
    cacheService.set(`room:${roomId}`, data, { ttl: CACHE_TTL });
    return data;
  },

  updateSettings: async (roomId: string, settings: Partial<RoomSettings>) => {
    const { data } = await api.patch<Room>(`/rooms/${roomId}/settings`, settings);
    cacheService.delete(`room:${roomId}`);
    return data;
  },

  joinRoom: async (roomId: string) => {
    const { data } = await api.post<Room>(`/rooms/${roomId}/join`);
    return data;
  },

  leaveRoom: async (roomId: string) => {
    await api.post(`/rooms/${roomId}/leave`);
    cacheService.delete(`room:${roomId}`);
  },
};

export default roomService; 