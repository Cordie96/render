import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import { createToken } from '../utils/auth';

describe('Room endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      },
    });

    userId = user.id;
    authToken = createToken(user);
  });

  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Room',
          allowGuestControl: true,
          autoPlay: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Test Room',
        hostId: userId,
        settings: {
          allowGuestControl: true,
          autoPlay: true,
        },
      });
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .send({
          name: 'Test Room',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/rooms/:id/settings', () => {
    let roomId: string;

    beforeEach(async () => {
      const room = await prisma.room.create({
        data: {
          name: 'Test Room',
          hostId: userId,
          settings: {
            allowGuestControl: false,
            autoPlay: true,
          },
        },
      });
      roomId = room.id;
    });

    it('should update room settings', async () => {
      const res = await request(app)
        .patch(`/api/rooms/${roomId}/settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          allowGuestControl: true,
          autoPlay: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.settings).toMatchObject({
        allowGuestControl: true,
        autoPlay: false,
      });
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
        .patch(`/api/rooms/${roomId}/settings`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          allowGuestControl: true,
        });

      expect(res.status).toBe(403);
    });
  });
}); 