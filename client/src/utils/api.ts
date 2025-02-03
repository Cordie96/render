import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      email,
      password,
    }),

  register: (username: string, email: string, password: string) =>
    api.post<ApiResponse<void>>('/auth/register', {
      username,
      email,
      password,
    }),

  me: () => api.get<ApiResponse<any>>('/auth/me'),
};

export const roomApi = {
  create: (name: string) =>
    api.post<ApiResponse<any>>('/rooms', { name }),

  join: (roomId: string) =>
    api.post<ApiResponse<any>>(`/rooms/${roomId}/join`),

  get: (roomId: string) =>
    api.get<ApiResponse<any>>(`/rooms/${roomId}`),

  close: (roomId: string) =>
    api.post<ApiResponse<void>>(`/rooms/${roomId}/close`),
};

export const queueApi = {
  getQueue: (roomId: string) =>
    api.get<ApiResponse<any>>(`/rooms/${roomId}/queue`),

  addToQueue: (roomId: string, video: { youtubeVideoId: string; title: string }) =>
    api.post<ApiResponse<any>>(`/rooms/${roomId}/queue`, video),

  removeFromQueue: (roomId: string, itemId: string) =>
    api.delete<ApiResponse<void>>(`/rooms/${roomId}/queue/${itemId}`),

  reorderQueue: (roomId: string, startIndex: number, endIndex: number) =>
    api.post<ApiResponse<any>>(`/rooms/${roomId}/queue/reorder`, {
      startIndex,
      endIndex,
    }),
};

export const youtubeApi = {
  search: (query: string) =>
    api.get<ApiResponse<any>>('/youtube/search', {
      params: { q: query },
    }),
};

export default api; 