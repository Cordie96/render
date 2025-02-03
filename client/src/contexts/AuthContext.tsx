import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await authApi.getCurrentUser();
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  }, [navigate]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { token, user } = await authApi.register(email, password, name);
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 