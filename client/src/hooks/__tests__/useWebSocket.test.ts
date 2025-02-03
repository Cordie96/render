import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useWebSocket } from '../useWebSocket';

// Mock dependencies
vi.mock('../useSocket', () => ({
  useSocket: () => ({
    socket: { emit: vi.fn() },
    on: vi.fn(),
  }),
}));

vi.mock('../useRoom', () => ({
  useRoom: () => ({
    updateRoom: vi.fn(),
  }),
}));

vi.mock('../useError', () => ({
  useError: () => ({
    handleError: vi.fn(),
  }),
}));

describe('useWebSocket', () => {
  const mockRoomId = 'test-room-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets up event listeners when socket is available', () => {
    const mockOn = vi.fn();
    vi.mocked(useSocket).mockReturnValue({
      socket: { emit: vi.fn() },
      on: mockOn,
    });

    renderHook(() => useWebSocket(mockRoomId));

    expect(mockOn).toHaveBeenCalledWith('room-closed', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('handles room-closed event', () => {
    const mockUpdateRoom = vi.fn();
    vi.mocked(useRoom).mockReturnValue({
      updateRoom: mockUpdateRoom,
    });

    let roomClosedCallback: Function;
    const mockOn = vi.fn((event, callback) => {
      if (event === 'room-closed') {
        roomClosedCallback = callback;
      }
      return vi.fn();
    });

    vi.mocked(useSocket).mockReturnValue({
      socket: { emit: vi.fn() },
      on: mockOn,
    });

    renderHook(() => useWebSocket(mockRoomId));

    roomClosedCallback();
    expect(mockUpdateRoom).toHaveBeenCalledWith({ isActive: false });
  });

  it('handles error event', () => {
    const mockHandleError = vi.fn();
    vi.mocked(useError).mockReturnValue({
      handleError: mockHandleError,
    });

    let errorCallback: Function;
    const mockOn = vi.fn((event, callback) => {
      if (event === 'error') {
        errorCallback = callback;
      }
      return vi.fn();
    });

    vi.mocked(useSocket).mockReturnValue({
      socket: { emit: vi.fn() },
      on: mockOn,
    });

    renderHook(() => useWebSocket(mockRoomId));

    errorCallback({ message: 'Test error' });
    expect(mockHandleError).toHaveBeenCalledWith('Test error');
  });
}); 