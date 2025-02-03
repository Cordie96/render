import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlayer } from '../usePlayer';
import { useSocket } from '../useSocket';

// Mock dependencies
vi.mock('../useSocket', () => ({
  useSocket: () => ({
    socket: { emit: vi.fn() },
    on: vi.fn(),
  }),
}));

describe('usePlayer', () => {
  const mockRoomId = 'test-room-id';
  const mockEmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({
      socket: { emit: mockEmit },
      on: vi.fn(),
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
  });

  it('handles play command', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));

    act(() => {
      result.current.play();
    });

    expect(mockEmit).toHaveBeenCalledWith('player-command', {
      roomId: mockRoomId,
      command: 'play',
    });
  });

  it('handles pause command', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));

    act(() => {
      result.current.pause();
    });

    expect(mockEmit).toHaveBeenCalledWith('player-command', {
      roomId: mockRoomId,
      command: 'pause',
    });
  });

  it('handles seek command', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));
    const seekTime = 30;

    act(() => {
      result.current.seek(seekTime);
    });

    expect(mockEmit).toHaveBeenCalledWith('player-command', {
      roomId: mockRoomId,
      command: 'seek',
      time: seekTime,
    });
  });

  it('updates state on player state change', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));

    act(() => {
      result.current.onStateChange(1); // Playing state
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.onStateChange(2); // Paused state
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('updates current time', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));
    const newTime = 45;

    act(() => {
      result.current.updateCurrentTime(newTime);
    });

    expect(result.current.currentTime).toBe(newTime);
  });

  it('handles player ready event', () => {
    const { result } = renderHook(() => usePlayer(mockRoomId));
    const mockPlayer = {
      playVideo: vi.fn(),
      seekTo: vi.fn(),
    };

    act(() => {
      result.current.onReady({ target: mockPlayer });
    });

    expect(result.current.player).toBe(mockPlayer);
  });
}); 