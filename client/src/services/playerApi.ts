import api from './api';

export const playerApi = {
  getPlayerState: async (roomId: string) => {
    const { data } = await api.get(`/rooms/${roomId}/player`);
    return data;
  },

  play: async (roomId: string) => {
    const { data } = await api.post(`/rooms/${roomId}/player/play`);
    return data;
  },

  pause: async (roomId: string) => {
    const { data } = await api.post(`/rooms/${roomId}/player/pause`);
    return data;
  },

  seek: async (roomId: string, time: number) => {
    const { data } = await api.post(`/rooms/${roomId}/player/seek`, { time });
    return data;
  },

  setVolume: async (roomId: string, volume: number) => {
    const { data } = await api.post(`/rooms/${roomId}/player/volume`, { volume });
    return data;
  },
};

export default playerApi; 