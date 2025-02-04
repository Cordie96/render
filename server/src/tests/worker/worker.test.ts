import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, redis } from '../setup.worker';
import { workerMetrics } from '../../services/workerMetrics';
import { processQueueItem } from '../../services/queueService';

describe('Worker Queue Processing', () => {
  beforeEach(async () => {
    await redis.flushAll();
    await workerMetrics.queueLength.reset();
  });

  it('processes queue items correctly', async () => {
    // Add test item to queue
    const queueItem = {
      type: 'test',
      data: { message: 'test message' }
    };

    await redis.lPush('queue:items', JSON.stringify(queueItem));
    
    // Verify queue length metric
    const length = await redis.lLen('queue:items');
    expect(length).toBe(1);
    
    // Process item
    const item = await redis.brPop('queue:items', 1);
    expect(item).toBeTruthy();
    
    if (item) {
      await processQueueItem(JSON.parse(item[1]));
    }
    
    // Verify queue is empty
    const newLength = await redis.lLen('queue:items');
    expect(newLength).toBe(0);
  });

  it('handles errors gracefully', async () => {
    // Add invalid item to queue
    const invalidItem = {
      type: 'invalid',
      data: {}
    };

    await redis.lPush('queue:items', JSON.stringify(invalidItem));
    
    // Process item
    const item = await redis.brPop('queue:items', 1);
    expect(item).toBeTruthy();
    
    if (item) {
      await expect(processQueueItem(JSON.parse(item[1]))).rejects.toThrow();
    }
    
    // Verify error metric
    const errorCount = await workerMetrics.queueErrors.get();
    expect(errorCount.values[0].value).toBeGreaterThan(0);
  });
}); 