import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useQueue } from '../useQueue';
import { useSocket } from '../useSocket';

vi.mock('../useSocket', () => ({
  useSocket: () => ({
    socket: { emit: vi.fn() },
    on: vi.fn(),
  }),
}));

describe('useQueue', () => {
  const mockRoomId = 'test-room-id';
  const mockEmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({
      socket: { emit: mockEmit },
      on: vi.fn(),
    });
  });

  it('initializes with empty queue', () => {
    const { result } = renderHook(() => useQueue(mockRoomId));
    expect(result.current.queue).toEqual([]);
    expect(result.current.currentItem).toBeNull();
  });

  it('handles add to queue', async () => {
    const { result } = renderHook(() => useQueue(mockRoomId));
    const mockVideo = { id: '1', title: 'Test Video' };

    await act(async () => {
      await result.current.addToQueue(mockVideo);
    });

    expect(mockEmit).toHaveBeenCalledWith('add-to-queue', {
      roomId: mockRoomId,
      video: mockVideo,
    });
  });

  it('handles remove from queue', async () => {
    const { result } = renderHook(() => useQueue(mockRoomId));
    const mockItemId = '1';

    await act(async () => {
      await result.current.removeFromQueue(mockItemId);
    });

    expect(mockEmit).toHaveBeenCalledWith('remove-from-queue', {
      roomId: mockRoomId,
      itemId: mockItemId,
    });
  });

  it('updates queue on socket events', () => {
    let queueUpdateCallback: Function;
    const mockOn = vi.fn((event, callback) => {
      if (event === 'queue-updated') {
        queueUpdateCallback = callback;
      }
      return vi.fn();
    });

    (useSocket as jest.Mock).mockReturnValue({
      socket: { emit: mockEmit },
      on: mockOn,
    });

    const { result } = renderHook(() => useQueue(mockRoomId));

    const mockQueueUpdate = {
      type: 'add',
      item: { id: '1', title: 'Test Video' },
    };

    act(() => {
      queueUpdateCallback(mockQueueUpdate);
    });

    expect(result.current.queue).toContainEqual(mockQueueUpdate.item);
  });
}); 