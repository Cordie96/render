import request from 'supertest';
import { Express } from 'express';
import { createTestUser, createTestRoom } from '../../tests/setup';
import { setupApp } from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let app: Express;

beforeAll(() => {
  app = setupApp();
});

describe('Room Controller', () => {
  let user: any;
  let token: string;

  beforeEach(async () => {
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;
  });

  describe('POST /api/rooms', () => {
    it('creates a new room', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Test Room' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'New Test Room',
        hostId: user.id,
        isActive: true,
      });
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ name: 'New Test Room' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      await createTestRoom(user.id);
    });

    it('returns user\'s rooms', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Test Room',
        hostId: user.id,
      });
    });

    it('only returns active rooms', async () => {
      await prisma.room.update({
        where: { hostId: user.id },
        data: { isActive: false },
      });

      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });
}); 