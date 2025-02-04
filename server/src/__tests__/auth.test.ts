import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import { hashPassword } from '../utils/auth';

describe('Auth endpoints', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await hashPassword('password123'),
        },
      });
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });
}); 