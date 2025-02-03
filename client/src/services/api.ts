import axios from 'axios';
import { Room, QueueItem, YouTubeVideo } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

export const roomApi = {
  getRooms: async () => {
    const { data } = await api.get('/rooms');
    return data;
  },

  createRoom: async (name: string) => {
    const { data } = await api.post('/rooms', { name });
    return data;
  },

  getRoom: async (roomId: string) => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
  },

  deleteRoom: async (roomId: string) => {
    await api.delete(`/rooms/${roomId}`);
  },
};

export const queueApi = {
  getQueue: async (roomId: string) => {
    const { data } = await api.get(`/rooms/${roomId}/queue`);
    return data;
  },

  addToQueue: async (roomId: string, video: { youtubeVideoId: string; title: string }) => {
    const { data } = await api.post(`/rooms/${roomId}/queue`, video);
    return data;
  },

  removeFromQueue: async (roomId: string, itemId: string) => {
    await api.delete(`/rooms/${roomId}/queue/${itemId}`);
  },

  reorderQueue: async (roomId: string, sourceIndex: number, destinationIndex: number) => {
    const { data } = await api.put(`/rooms/${roomId}/queue/reorder`, {
      sourceIndex,
      destinationIndex,
    });
    return data;
  },

  skipCurrent: async (roomId: string) => {
    const { data } = await api.post(`/rooms/${roomId}/queue/skip`);
    return data;
  },
};

export const youtubeApi = {
  search: async (query: string) => {
    const { data } = await api.get('/youtube/search', {
      params: { q: query },
    });
    return data;
  },
};

export default api; 