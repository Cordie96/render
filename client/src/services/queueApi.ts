import api from './api';
import { QueueItem } from '../types';

export const queueApi = {
  getQueue: async (roomId: string) => {
    const { data } = await api.get<{ queue: QueueItem[]; currentItem: QueueItem | null }>(
      `/rooms/${roomId}/queue`
    );
    return data;
  },

  addToQueue: async (roomId: string, video: { youtubeVideoId: string; title: string }) => {
    const { data } = await api.post<QueueItem>(`/rooms/${roomId}/queue`, video);
    return data;
  },

  removeFromQueue: async (roomId: string, itemId: string) => {
    await api.delete(`/rooms/${roomId}/queue/${itemId}`);
  },

  reorderQueue: async (roomId: string, sourceIndex: number, destinationIndex: number) => {
    const { data } = await api.post<{ queue: QueueItem[] }>(`/rooms/${roomId}/queue/reorder`, {
      sourceIndex,
      destinationIndex,
    });
    return data;
  },

  skipCurrent: async (roomId: string) => {
    await api.post(`/rooms/${roomId}/queue/skip`);
  },
};

export default queueApi; 