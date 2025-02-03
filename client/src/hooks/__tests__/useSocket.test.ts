import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useSocket } from '../useSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes socket connection', () => {
    renderHook(() => useSocket());
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it('provides socket instance and methods', () => {
    const { result } = renderHook(() => useSocket());
    expect(result.current.socket).toBeDefined();
    expect(typeof result.current.emit).toBe('function');
    expect(typeof result.current.on).toBe('function');
  });

  it('handles emit correctly', () => {
    const mockEmit = vi.fn();
    (io as jest.Mock).mockImplementation(() => ({
      emit: mockEmit,
      on: vi.fn(),
      off: vi.fn(),
    }));

    const { result } = renderHook(() => useSocket());
    const eventData = { message: 'test' };

    act(() => {
      result.current.emit('test-event', eventData);
    });

    expect(mockEmit).toHaveBeenCalledWith('test-event', eventData);
  });

  it('handles event subscription correctly', () => {
    const mockOn = vi.fn();
    const mockOff = vi.fn();
    (io as jest.Mock).mockImplementation(() => ({
      emit: vi.fn(),
      on: mockOn,
      off: mockOff,
    }));

    const { result } = renderHook(() => useSocket());
    const callback = vi.fn();

    act(() => {
      const unsubscribe = result.current.on('test-event', callback);
      unsubscribe();
    });

    expect(mockOn).toHaveBeenCalledWith('test-event', expect.any(Function));
    expect(mockOff).toHaveBeenCalledWith('test-event', expect.any(Function));
  });

  it('cleans up socket connection on unmount', () => {
    const mockDisconnect = vi.fn();
    (io as jest.Mock).mockImplementation(() => ({
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      disconnect: mockDisconnect,
    }));

    const { unmount } = renderHook(() => useSocket());
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
}); 