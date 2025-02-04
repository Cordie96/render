import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlayerState } from '../usePlayerState';
import { useSocket } from '../../contexts/SocketContext';

// Mock the socket context
vi.mock('../../contexts/SocketContext', () => ({
  useSocket: vi.fn(),
}));

describe('usePlayerState', () => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({ socket: mockSocket });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
  });

  it('handles play action', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));

    act(() => {
      result.current.handlePlay();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('player:play', {
      roomId: 'room-123',
    });
  });

  it('handles pause action', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));

    act(() => {
      result.current.handlePause();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('player:pause', {
      roomId: 'room-123',
    });
  });

  it('handles seek action', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));

    act(() => {
      result.current.handleSeek(30);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('player:seek', {
      roomId: 'room-123',
      time: 30,
    });
  });

  it('updates state on socket events', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));

    // Simulate socket events
    const mockSocketCallbacks: Record<string, Function> = {};
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      mockSocketCallbacks[event] = callback;
    });

    // Trigger play event
    act(() => {
      mockSocketCallbacks['player:state']({
        isPlaying: true,
        currentTime: 15,
        duration: 180,
      });
    });

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTime).toBe(15);
    expect(result.current.duration).toBe(180);
  });

  it('cleans up socket listeners on unmount', () => {
    const { unmount } = renderHook(() => usePlayerState('room-123'));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('player:state');
    expect(mockSocket.off).toHaveBeenCalledWith('player:error');
  });

  it('handles errors', () => {
    const { result } = renderHook(() => usePlayerState('room-123'));
    const mockSocketCallbacks: Record<string, Function> = {};
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      mockSocketCallbacks[event] = callback;
    });

    act(() => {
      mockSocketCallbacks['player:error']('Test error message');
    });

    expect(result.current.error).toBe('Test error message');
  });
}); 