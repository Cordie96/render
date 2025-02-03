import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useRoom } from '../useRoom';
import { roomApi } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  roomApi: {
    createRoom: vi.fn(),
    getRoom: vi.fn(),
    updateRoom: vi.fn(),
  },
}));

describe('useRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty room state', () => {
    const { result } = renderHook(() => useRoom());
    expect(result.current.room).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles create room', async () => {
    const mockRoom = { id: '1', name: 'Test Room' };
    (roomApi.createRoom as jest.Mock).mockResolvedValueOnce({ data: mockRoom });

    const { result } = renderHook(() => useRoom());

    await act(async () => {
      await result.current.createRoom('Test Room');
    });

    expect(result.current.room).toEqual(mockRoom);
    expect(roomApi.createRoom).toHaveBeenCalledWith('Test Room');
  });

  it('handles get room', async () => {
    const mockRoom = { id: '1', name: 'Test Room' };
    (roomApi.getRoom as jest.Mock).mockResolvedValueOnce({ data: mockRoom });

    const { result } = renderHook(() => useRoom());

    await act(async () => {
      await result.current.getRoom('1');
    });

    expect(result.current.room).toEqual(mockRoom);
    expect(roomApi.getRoom).toHaveBeenCalledWith('1');
  });

  it('handles update room', async () => {
    const mockRoom = { id: '1', name: 'Updated Room' };
    (roomApi.updateRoom as jest.Mock).mockResolvedValueOnce({ data: mockRoom });

    const { result } = renderHook(() => useRoom());

    await act(async () => {
      await result.current.updateRoom('1', { name: 'Updated Room' });
    });

    expect(result.current.room).toEqual(mockRoom);
    expect(roomApi.updateRoom).toHaveBeenCalledWith('1', { name: 'Updated Room' });
  });

  it('handles errors', async () => {
    const mockError = new Error('Failed to create room');
    (roomApi.createRoom as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useRoom());

    await act(async () => {
      try {
        await result.current.createRoom('Test Room');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.error).toBe('Failed to create room');
  });
}); 