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

describe('Error Handling', () => {
  let token: string;
  let roomId: string;

  beforeEach(async () => {
    const { user, token: userToken } = await createTestUser();
    token = userToken;
    const room = await createTestRoom(user.id);
    roomId = room.id;
  });

  describe('Input Validation', () => {
    it('validates room creation input', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }); // Empty name

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('validates queue item input', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/queue`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          youtubeVideoId: '', // Empty video ID
          title: 'Test Song',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authorization', () => {
    it('prevents non-participants from accessing room', async () => {
      const { token: otherToken } = await createTestUser();

      const response = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });

    it('prevents non-hosts from closing room', async () => {
      const { token: otherToken } = await createTestUser();

      const response = await request(app)
        .post(`/api/rooms/${roomId}/close`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Resource Not Found', () => {
    it('handles non-existent room', async () => {
      const response = await request(app)
        .get('/api/rooms/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('handles non-existent queue item', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${roomId}/queue/non-existent-id`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits on YouTube search', async () => {
      const requests = Array(11).fill(null).map(() => 
        request(app)
          .get('/api/youtube/search')
          .query({ q: 'test' })
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.some(r => r.status === 429);
      expect(tooManyRequests).toBe(true);
    });
  });
}); 