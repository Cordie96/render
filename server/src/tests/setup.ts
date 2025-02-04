import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { beforeAll, afterAll, beforeEach } from 'vitest';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
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
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

beforeEach(async () => {
  // Clean up between tests
  await prisma.queueItem.deleteMany();
  await redis.flushAll();
});

// Test helpers
export async function createTestUser() {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword'
    }
  });
}

export async function createTestRoom(userId: string) {
  return prisma.room.create({
    data: {
      name: 'Test Room',
      hostId: userId,
      isActive: true,
      participants: {
        create: {
          userId,
          role: 'HOST'
        }
      }
    },
    include: {
      participants: true
    }
  });
}

export async function createTestQueueItem(roomId: string, userId: string) {
  return prisma.queueItem.create({
    data: {
      roomId,
      youtubeVideoId: 'test123',
      title: 'Test Video',
      addedById: userId,
      position: 0,
      status: 'PENDING'
    }
  });
} 