import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import { createToken } from '../utils/auth';
import { redis } from '../redis';

describe('Queue endpoints', () => {
  let authToken: string;
  let userId: string;
  let roomId: string;

  beforeEach(async () => {
    await prisma.queueItem.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
    await redis.flushall();

    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      },
    });

    userId = user.id;
    authToken = createToken(user);

    const room = await prisma.room.create({
      data: {
        name: 'Test Room',
        hostId: userId,
      },
    });

    roomId = room.id;
  });

  describe('POST /api/rooms/:roomId/queue', () => {
    it('should add item to queue', async () => {
      const res = await request(app)
        .post(`/api/rooms/${roomId}/queue`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          youtubeVideoId: 'test123',
          title: 'Test Video',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        youtubeVideoId: 'test123',
        title: 'Test Video',
        addedBy: 'testuser',
        addedById: userId,
      });
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post(`/api/rooms/${roomId}/queue`)
        .send({
          youtubeVideoId: 'test123',
          title: 'Test Video',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/rooms/:roomId/queue/:itemId', () => {
    let queueItemId: string;

    beforeEach(async () => {
      const queueItem = await prisma.queueItem.create({
        data: {
          roomId,
          youtubeVideoId: 'test123',
          title: 'Test Video',
          addedBy: 'testuser',
          addedById: userId,
        },
      });

      queueItemId = queueItem.id;
    });

    it('should remove item from queue', async () => {
      const res = await request(app)
        .delete(`/api/rooms/${roomId}/queue/${queueItemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      const item = await prisma.queueItem.findUnique({
        where: { id: queueItemId },
      });
      expect(item).toBeNull();
    });

    it('requires room host or item owner permission', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'other',
          email: 'other@example.com',
          password: 'hashedpassword',
        },
      });

      const otherToken = createToken(otherUser);

      const res = await request(app)
        .delete(`/api/rooms/${roomId}/queue/${queueItemId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/rooms/:roomId/queue/reorder', () => {
    let queueItems: any[];

    beforeEach(async () => {
      queueItems = await prisma.queueItem.createMany({
        data: [
          {
            roomId,
            youtubeVideoId: 'test1',
            title: 'Test 1',
            addedBy: 'testuser',
            addedById: userId,
            position: 0,
          },
          {
            roomId,
            youtubeVideoId: 'test2',
            title: 'Test 2',
            addedBy: 'testuser',
            addedById: userId,
            position: 1,
          },
        ],
      });
    });

    it('should reorder queue items', async () => {
      const res = await request(app)
        .put(`/api/rooms/${roomId}/queue/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: queueItems[1].id,
          newPosition: 0,
        });

      expect(res.status).toBe(200);
      expect(res.body[0].youtubeVideoId).toBe('test2');
      expect(res.body[1].youtubeVideoId).toBe('test1');
    });

    it('requires room host permission', async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: 'other',
          email: 'other@example.com',
          password: 'hashedpassword',
        },
      });

      const otherToken = createToken(otherUser);

      const res = await request(app)
        .put(`/api/rooms/${roomId}/queue/reorder`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          itemId: queueItems[1].id,
          newPosition: 0,
        });

      expect(res.status).toBe(403);
    });
  });
}); 