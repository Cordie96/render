import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from '../useAuth';
import { authApi } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with empty user state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('handles login successfully', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        token: 'test-token',
      },
    };
    (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe(mockResponse.data.token);
    expect(localStorage.getItem('token')).toBe(mockResponse.data.token);
  });

  it('handles register successfully', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        token: 'test-token',
      },
    };
    (authApi.register as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register('testuser', 'test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe(mockResponse.data.token);
    expect(localStorage.getItem('token')).toBe(mockResponse.data.token);
  });

  it('handles logout', () => {
    localStorage.setItem('token', 'test-token');
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('loads user from token on mount', async () => {
    localStorage.setItem('token', 'test-token');
    const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuth());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.loading).toBe(false);
  });

  it('handles login error', async () => {
    const mockError = new Error('Invalid credentials');
    (authApi.login as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
}); 