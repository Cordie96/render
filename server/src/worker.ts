import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { processQueueItem } from './services/queueService';
import { workerMetrics } from './services/workerMetrics';
import { workerLogger as logger } from './utils/workerLogger';
import { RateLimiter } from './services/rateLimiter';
import { CircuitBreaker } from './services/circuitBreaker';
import { WorkerErrorHandler } from './services/workerErrorHandler';
import { QueueProcessingError, WorkerResourceError, WorkerStateError } from './utils/workerErrors';
import { WorkerCoordinator } from './services/workerCoordinator';
import './worker-health';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL
});

const rateLimiter = new RateLimiter(redis);
const circuitBreaker = new CircuitBreaker();
const errorHandler = new WorkerErrorHandler();
const coordinator = new WorkerCoordinator(redis);
let retryCount = 0;

async function processQueue() {
  const end = workerMetrics.startProcessing('queue');
  try {
    // Check if this worker should process work
    if (!await coordinator.shouldProcessWork()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    // Check rate limit
    if (await rateLimiter.isRateLimited('queue_processing')) {
      logger.warn('Queue processing rate limited');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    // Get next item from Redis queue
    const queueItem = await redis.brPop('queue:items', 5);
    
    if (!queueItem) {
      return; // No items in queue
    }

    const item = JSON.parse(queueItem[1]);
    // Use circuit breaker for processing
    await circuitBreaker.execute(async () => {
      await processQueueItem(item);
    });
    end({ success: true });
    retryCount = 0; // Reset retry count on success
    // Update queue length after processing
    const length = await redis.lLen('queue');
    workerMetrics.updateQueueLength(length);
  } catch (error) {
    end({ success: false });
    await errorHandler.handleError(error, retryCount++, {
      queueItem: queueItem?.[1],
      processId: process.pid
    });
  }
}

async function startWorker() {
  try {
    await redis.connect();
    await coordinator.start();
    workerMetrics.setActiveWorkers(1);
    logger.info('Queue worker started');

    // Process items continuously
    while (true) {
      await processQueue();
      // Small delay to prevent CPU spinning
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    const workerError = new WorkerStateError(
      'Worker startup failed',
      ErrorSeverity.CRITICAL,
      false,
      { error: error.message }
    );
    await errorHandler.handleError(workerError, 0);
    await coordinator.stop();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Worker shutting down...');
  await coordinator.stop();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
});

startWorker().catch((error) => {
  logger.error('Failed to start worker:', error);
  process.exit(1);
}); 