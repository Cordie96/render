import api from './api';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

export default authApi; 