import { performance } from 'perf_hooks';
import request from 'supertest';
import { Express } from 'express';
import { setupApp } from '../../app';
import { createTestUser, createTestRoom } from '../setup';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let app: Express;

beforeAll(() => {
  app = setupApp();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API Performance Tests', () => {
  let token: string;
  let roomId: string;

  beforeEach(async () => {
    const { user, token: userToken } = await createTestUser();
    token = userToken;
    const room = await createTestRoom(user.id);
    roomId = room.id;
  });

  it('handles bulk queue operations efficiently', async () => {
    const NUM_OPERATIONS = 100;
    const operations = Array(NUM_OPERATIONS)
      .fill(null)
      .map((_, i) => ({
        youtubeVideoId: `video${i}`,
        title: `Test Song ${i}`,
      }));

    const start = performance.now();

    await Promise.all(
      operations.map((op) =>
        request(app)
          .post(`/api/rooms/${roomId}/queue`)
          .set('Authorization', `Bearer ${token}`)
          .send(op)
      )
    );

    const end = performance.now();
    const duration = end - start;

    // Average time per operation should be less than 50ms
    expect(duration / NUM_OPERATIONS).toBeLessThan(50);
  });

  it('maintains performance with large queue', async () => {
    // First, create a large queue
    const QUEUE_SIZE = 1000;
    await Promise.all(
      Array(QUEUE_SIZE)
        .fill(null)
        .map((_, i) =>
          prisma.queueItem.create({
            data: {
              roomId,
              youtubeVideoId: `video${i}`,
              title: `Test Song ${i}`,
              position: i,
              status: 'pending',
              addedById: 'test-user-id',
            },
          })
        )
    );

    const start = performance.now();

    // Get queue
    const response = await request(app)
      .get(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${token}`);

    const end = performance.now();
    const duration = end - start;

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(QUEUE_SIZE);
    // Response time should be less than 1 second even with large queue
    expect(duration).toBeLessThan(1000);
  });
}); 