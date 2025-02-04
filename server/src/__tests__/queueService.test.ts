import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient, QueueItem } from '@prisma/client';
import { processQueueItem } from '../services/queueService';
import { validateYouTubeVideo } from '../services/youtubeService';
import { io } from '../websocket/server';
import { logger } from '../utils/logger';

// Mock dependencies
vi.mock('@prisma/client');
vi.mock('../services/youtubeService');
vi.mock('../websocket/server');
vi.mock('../utils/logger');

describe('queueService', () => {
  const mockQueueItem: QueueItem = {
    id: '1',
    roomId: 'room1',
    youtubeVideoId: 'video123',
    title: 'Test Video',
    addedById: 'user1',
    position: 0,
    status: 'PENDING',
    addedAt: new Date(),
    duration: null,
    errorMessage: null
  };

  const mockVideoDetails = {
    id: 'video123',
    title: 'Test Video',
    duration: 180,
    isAvailable: true,
    isAppropriate: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (validateYouTubeVideo as any).mockResolvedValue(mockVideoDetails);
    (io.to as any).mockReturnValue({ emit: vi.fn() });
  });

  it('successfully processes a queue item', async () => {
    const mockPrisma = {
      queueItem: {
        update: vi.fn().mockResolvedValue({ ...mockQueueItem, status: 'COMPLETED' })
      }
    };
    (PrismaClient as any).mockImplementation(() => mockPrisma);

    await processQueueItem(mockQueueItem);

    // Verify status updates
    expect(mockPrisma.queueItem.update).toHaveBeenCalledWith({
      where: { id: mockQueueItem.id },
      data: expect.objectContaining({
        status: 'COMPLETED',
        title: mockVideoDetails.title,
        duration: mockVideoDetails.duration
      })
    });

    // Verify WebSocket notifications
    expect(io.to).toHaveBeenCalledWith(`room:${mockQueueItem.roomId}`);
  });

  it('handles validation failures', async () => {
    const error = new Error('Video not available');
    (validateYouTubeVideo as any).mockRejectedValue(error);

    const mockPrisma = {
      queueItem: {
        update: vi.fn().mockResolvedValue({ ...mockQueueItem, status: 'ERROR' })
      }
    };
    (PrismaClient as any).mockImplementation(() => mockPrisma);

    await processQueueItem(mockQueueItem);

    // Verify error status update
    expect(mockPrisma.queueItem.update).toHaveBeenCalledWith({
      where: { id: mockQueueItem.id },
      data: expect.objectContaining({
        status: 'ERROR',
        errorMessage: error.message
      })
    });

    // Verify error logging
    expect(logger.error).toHaveBeenCalled();
  });

  it('rejects videos that exceed maximum duration', async () => {
    (validateYouTubeVideo as any).mockResolvedValue({
      ...mockVideoDetails,
      duration: 15 * 60 // 15 minutes
    });

    await processQueueItem(mockQueueItem);

    // Verify error status
    expect(PrismaClient().queueItem.update).toHaveBeenCalledWith({
      where: { id: mockQueueItem.id },
      data: expect.objectContaining({
        status: 'ERROR',
        errorMessage: 'Video exceeds maximum duration'
      })
    });
  });
}); 