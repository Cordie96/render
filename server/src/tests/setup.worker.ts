import { beforeAll, afterAll } from 'vitest';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { workerMetrics } from '../services/workerMetrics';
import { workerLogger } from '../utils/workerLogger';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL
});

beforeAll(async () => {
  // Connect to Redis
  await redis.connect();
  
  // Clean up database
  await prisma.queueItem.deleteMany();
  await prisma.roomParticipant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  
  // Clean up Redis
  await redis.flushAll();
  
  // Reset metrics
  await workerMetrics.queueLength.reset();
  await workerMetrics.queueErrors.reset();
  await workerMetrics.activeWorkers.reset();
  
  workerLogger.info('Worker test setup complete');
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

export { prisma, redis }; 