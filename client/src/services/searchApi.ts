import api from './api';
import { YouTubeVideo } from '../types';

export const searchApi = {
  searchVideos: async (query: string) => {
    const { data } = await api.get<YouTubeVideo[]>('/youtube/search', {
      params: { q: query },
    });
    return data;
  },

  getVideoDetails: async (videoId: string) => {
    const { data } = await api.get<YouTubeVideo>(`/youtube/videos/${videoId}`);
    return data;
  },
};

export default searchApi; 