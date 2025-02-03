import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useQueueManagement } from '../useQueueManagement';
import { queueApi } from '../../utils/api';

// Mock dependencies
vi.mock('../../utils/api', () => ({
  queueApi: {
    getQueue: vi.fn(),
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    reorderQueue: vi.fn(),
  },
}));

vi.mock('../useSocket', () => ({
  useSocket: () => ({
    socket: { emit: vi.fn() },
    on: vi.fn(),
    emit: vi.fn(),
  }),
}));

describe('useQueueManagement', () => {
  const mockRoomId = 'test-room-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches initial queue', async () => {
    const mockQueue = {
      queue: [{ id: '1', title: 'Test Song' }],
      currentItem: null,
    };

    (queueApi.getQueue as jest.Mock).mockResolvedValueOnce({ data: mockQueue });

    const { result } = renderHook(() => useQueueManagement(mockRoomId));

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.queue).toEqual(mockQueue.queue);
    expect(result.current.currentItem).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles add to queue', async () => {
    const mockVideo = { youtubeVideoId: '123', title: 'Test Song' };
    const mockResponse = { data: { id: '1', ...mockVideo } };

    (queueApi.addToQueue as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useQueueManagement(mockRoomId));

    await act(async () => {
      await result.current.addToQueue(mockVideo);
    });

    expect(queueApi.addToQueue).toHaveBeenCalledWith(mockRoomId, mockVideo);
  });

  it('handles remove from queue', async () => {
    const mockItemId = 'test-item-id';

    const { result } = renderHook(() => useQueueManagement(mockRoomId));

    await act(async () => {
      await result.current.removeFromQueue(mockItemId);
    });

    expect(queueApi.removeFromQueue).toHaveBeenCalledWith(mockRoomId, mockItemId);
  });

  it('handles reorder queue', async () => {
    const startIndex = 0;
    const endIndex = 1;

    const { result } = renderHook(() => useQueueManagement(mockRoomId));

    await act(async () => {
      await result.current.reorderQueue(startIndex, endIndex);
    });

    expect(queueApi.reorderQueue).toHaveBeenCalledWith(mockRoomId, startIndex, endIndex);
  });
}); 