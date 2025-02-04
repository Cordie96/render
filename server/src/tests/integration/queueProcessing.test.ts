import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { createTestUser, createTestRoom, createTestQueueItem } from '../setup';
import { processQueueItem } from '../../services/queueService';
import { validateYouTubeVideo } from '../../services/youtubeService';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

describe('Queue Processing Integration', () => {
  let userId: string;
  let roomId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    const room = await createTestRoom(userId);
    roomId = room.id;
  });

  it('processes queue items through the complete flow', async () => {
    // Create a queue item
    const queueItem = await createTestQueueItem(roomId, userId);

    // Add to Redis queue
    await redis.lPush('queue:items', JSON.stringify({
      id: queueItem.id,
      roomId: queueItem.roomId,
      youtubeVideoId: queueItem.youtubeVideoId
    }));

    // Process the queue
    const processedItem = await processQueueItem(queueItem);

    // Verify the item was processed
    const updatedItem = await prisma.queueItem.findUnique({
      where: { id: queueItem.id }
    });

    expect(updatedItem).toBeDefined();
    expect(updatedItem?.status).toBe('COMPLETED');
    expect(updatedItem?.duration).toBeGreaterThan(0);
  });

  it('handles invalid YouTube videos', async () => {
    // Create a queue item with invalid video ID
    const queueItem = await createTestQueueItem(roomId, userId);
    queueItem.youtubeVideoId = 'invalid123';

    // Process the queue
    await processQueueItem(queueItem);

    // Verify error handling
    const updatedItem = await prisma.queueItem.findUnique({
      where: { id: queueItem.id }
    });

    expect(updatedItem).toBeDefined();
    expect(updatedItem?.status).toBe('ERROR');
    expect(updatedItem?.errorMessage).toBeTruthy();
  });

  it('maintains queue order during processing', async () => {
    // Create multiple queue items
    const items = await Promise.all([
      createTestQueueItem(roomId, userId),
      createTestQueueItem(roomId, userId),
      createTestQueueItem(roomId, userId)
    ]);

    // Add all items to Redis queue
    for (const item of items) {
      await redis.lPush('queue:items', JSON.stringify({
        id: item.id,
        roomId: item.roomId,
        youtubeVideoId: item.youtubeVideoId
      }));
    }

    // Process all items
    await Promise.all(items.map(processQueueItem));

    // Verify order is maintained
    const processedItems = await prisma.queueItem.findMany({
      where: { roomId },
      orderBy: { position: 'asc' }
    });

    expect(processedItems).toHaveLength(items.length);
    expect(processedItems.map(item => item.id)).toEqual(
      items.map(item => item.id).reverse()
    );
  });
}); 